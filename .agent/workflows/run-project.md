---
description: Cómo ejecutar y probar GymTrack Pro
---

# Flujo de Trabajo: Ejecución de GymTrack Pro

Sigue estos pasos para arrancar el proyecto completo por primera vez.

## Opción A: Despliegue con Docker (Más fácil)

1. Abre la terminal en el directorio `GymTrackPro`.
2. Ejecuta el comando para levantar los servicios:
// turbo
```powershell
docker-compose up --build
```
3. Espera a que los contenedores estén listos.
4. Abre tu navegador en [http://localhost:8080](http://localhost:8080).

## Opción B: Ejecución Manual para Desarrollo

### 1. Preparar la Base de Datos
Asegúrate de tener MySQL/MariaDB corriendo y ejecuta:
```sql
CREATE DATABASE gymtrack_pro;
```

### 2. Arrancar el Backend
// turbo
```powershell
cd backend
.\venv\Scripts\activate
python run.py
```

### 3. Arrancar el Frontend
// turbo
```powershell
cd frontend
npm run dev
```

## Pruebas de Funcionamiento

1. **Registro**: Crea una cuenta nueva en la página de `/register`.
2. **Login**: Entra con tus credenciales.
3. **Rutinas**: Ve a la sección de Workouts y crea una rutina nueva.
4. **Entrenamiento**: Dale a "Start" en una rutina para probar el logger en tiempo real.
