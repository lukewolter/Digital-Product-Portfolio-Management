"""
Main server file that combines FastAPI and Socket.IO
"""
from app.main import app as fastapi_app
from app.websocket import socket_app, sio

app = socket_app
