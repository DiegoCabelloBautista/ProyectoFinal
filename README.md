# GymTrack Pro - Proyecto Final

Este es el proyecto final **GymTrack Pro**, una aplicación web diseñada para la gestión de rutinas de entrenamiento y progresión de cargas, totalmente en español.

## 🚀 Tecnologías Utilizadas

- **Backend**: Python 3.11 + Flask (Estructura de Blueprints)
- **Frontend**: TypeScript + React + Vite
- **Estilos**: Tailwind CSS (Diseño Premium Dark Mode)
- **Base de Datos**: MariaDB / MySQL
- **Contenedores**: Docker & Docker Compose

## 🛠️ Estructura del Proyecto

```text
GymTrackPro/
├── backend/            # API Flask
│   ├── app/            # Código fuente (modelos, rutas, config)
│   └── Dockerfile
├── frontend/           # App React
│   ├── src/            # Componentes, Contexto, Servicios
│   └── Dockerfile
└── docker-compose.yml  # Configuración de infraestructura
```

## 🏁 Instrucciones de Ejecución (Docker)

1. Abre una terminal en la raíz del proyecto (`GymTrackPro`).
2. Ejecuta:
   ```bash
   docker-compose up -d --build
   ```
3. Accede a:
   - Web: [http://localhost:8080](http://localhost:8080)
   - API: [http://localhost:5000/api](http://localhost:5000/api)

## ✨ Características (Fase 1)

1. **Gestión de Usuarios**: Registro e inicio de sesión con JWT.
2. **Constructor de Rutinas**: Añade ejercicios personalizados a tus rutinas.
3. **Seguimiento en Vivo**: Cronómetro y registro de series en tiempo real.
4. **Dashboard**: Visualización de estadísticas y volumen de entrenamiento.
5. **Idioma**: Interfaz y mensajes completamente en español.
