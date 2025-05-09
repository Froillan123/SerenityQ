import os
import sys
import time
import subprocess
import signal
import importlib
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

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
                print("\n🔄 Model changes detected! Restarting application...")
                restart_app()

def run_flask_app():
    """Run the Flask application"""
    global app_process
    # First, check if we need to apply migrations
    try:
        # Try to initialize migrations if not already done
        init_result = subprocess.run(
            ["flask", "db", "init"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if "already exists" in init_result.stderr:
            print("✅ Migrations folder already exists")
        elif init_result.returncode == 0:
            print("✅ Initialized migrations successfully")
        else:
            print("⚠️ Failed to initialize migrations, but continuing...")
            
        # Generate migration
        migrate_result = subprocess.run(
            ["flask", "db", "migrate", "-m", "auto migration from model changes"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if migrate_result.returncode == 0:
            print("✅ Migration generated successfully")
            
            # Apply migration
            upgrade_result = subprocess.run(
                ["flask", "db", "upgrade"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if upgrade_result.returncode == 0:
                print("✅ Database upgraded successfully")
            else:
                print(f"❌ Database upgrade error: {upgrade_result.stderr}")
        else:
            print(f"⚠️ Migration warning: {migrate_result.stderr}")
            if "Target database is not up to date" in migrate_result.stderr:
                print("🔄 Running database upgrade first...")
                subprocess.run(["flask", "db", "upgrade"])
                print("✅ Now retrying migration...")
                subprocess.run(["flask", "db", "migrate", "-m", "auto migration from model changes"])
                subprocess.run(["flask", "db", "upgrade"])
    except Exception as e:
        print(f"⚠️ Migration exception: {str(e)}")
    
    # Run the application
    print("\n🚀 Starting SerenityQ application...")
    app_process = subprocess.Popen(["python", "app.py"])
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
        # Set FLASK_APP environment variable
        os.environ["FLASK_APP"] = "app.py"
        
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