from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints

app = Flask(__name__)

app.config.from_object('dbconfig')


db.init_app(app)
jwt.init_app(app)

app.register_blueprint(auth_bp)  
app.register_blueprint(user_bp, url_prefix='/user') 
app.register_blueprint(admin_bp, url_prefix='/admin')  
app.register_blueprint(psychologist_bp, url_prefix='/psychologist') 

if __name__ == '__main__':
    app.run(debug=True)
