#!/bin/bash

echo "Starting Resume AI Application..."
echo

echo "Starting Backend (Java Spring Boot)..."
cd backend
gnome-terminal --title="Resume AI Backend" -- bash -c "mvn spring-boot:run; exec bash" &

echo "Waiting for backend to start..."
sleep 10

echo "Starting Frontend (React + Vite)..."
cd ../frontend
gnome-terminal --title="Resume AI Frontend" -- bash -c "npm run dev; exec bash" &

echo
echo "========================================"
echo "Resume AI Application is starting..."
echo
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo
echo "Press Enter to continue..."
read