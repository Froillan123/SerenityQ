import os
import sys
import time
import subprocess
import signal
import importlib
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
models_file = os.path.join(current_dir, 'models.py')
app_process = None
observer = None

class ModelChangeHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_modified = time.time()
        
    def on_modified(self, event):
        # Only respond to changes in the models.py file
        if event.src_path == models_file:
            current_time = time.time()
            # Debounce to avoid multiple restarts for a single edit
            if current_time - self.last_modified > 1:
                self.last_modified = current_time
                print("\n🔄 Model changes detected! Syncing database schema...")
                restart_app()

def run_flask_app():
    """Run the Flask application"""
    global app_process
    
    # Set FLASK_APP environment variable
    os.environ["FLASK_APP"] = "app.py"
    
    # First, synchronize the database schema
    try:
        print("🔄 Checking database connection...")
        # Prepare environment
        env_copy = os.environ.copy()
        
        # Check if migration directory exists
        if not os.path.exists('migrations'):
            print("🔄 Initializing migrations...")
            subprocess.run(
                ["flask", "db", "init"],
                env=env_copy,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
        
        # Generate and apply migrations (like Sequelize sync)
        print("🔄 Checking for model changes...")
        migrate_process = subprocess.run(
            ["flask", "db", "migrate", "-m", "Auto migration from model changes"],
            env=env_copy,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # If migration was generated successfully, apply it
        if migrate_process.returncode == 0:
            print("🔄 Applying migrations...")
            subprocess.run(
                ["flask", "db", "upgrade"],
                env=env_copy,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            print("✅ Database schema synchronized")
        else:
            print("✅ No schema changes detected or error occurred")
            if "Target database is not up to date" in migrate_process.stderr:
                print("🔄 Running database upgrade first...")
                subprocess.run(["flask", "db", "upgrade"], env=env_copy)
                print("🔄 Retrying migration...")
                subprocess.run(["flask", "db", "migrate", "-m", "Auto migration"], env=env_copy)
                subprocess.run(["flask", "db", "upgrade"], env=env_copy)
    except Exception as e:
        print(f"⚠️ Database sync exception: {str(e)}")
    
    # Run the application
    print("\n🚀 Starting SerenityQ application...")
    app_process = subprocess.Popen(["python", "app.py"], env=env_copy)
    return app_process

def stop_app():
    """Stop the Flask application"""
    global app_process
    if app_process:
        print("\n🛑 Stopping application...")
        # Send SIGTERM to the process
        if sys.platform == "win32":
            app_process.terminate()
        else:
            os.kill(app_process.pid, signal.SIGTERM)
        app_process.wait()
        app_process = None

def restart_app():
    """Restart the Flask application"""
    stop_app()
    run_flask_app()

def stop_observer():
    """Stop the file observer"""
    global observer
    if observer:
        observer.stop()
        observer.join()

def cleanup():
    """Cleanup resources"""
    stop_app()
    stop_observer()

def start_file_watcher():
    """Start watching for changes in the models file"""
    global observer
    event_handler = ModelChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(models_file), recursive=False)
    observer.start()
    print("👀 Watching for model changes...")

def main():
    """Main entry point"""
    try:
        # Configuration info
        db_url = os.getenv('DATABASE_URL', 'Local MySQL database')
        if 'proxy.rlwy.net' in db_url:
            print(f"🔌 Using PostgreSQL on Railway")
        else:
            print(f"🔌 Using development database")
            
        # Start the file watcher
        start_file_watcher()
        
        # Run the Flask app
        run_flask_app()
        
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    finally:
        cleanup()

if __name__ == "__main__":
    main() 