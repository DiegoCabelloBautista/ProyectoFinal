# GymTrack Pro 🏋️‍♂️✨

**GymTrack Pro** es una plataforma web Full-Stack de alto rendimiento diseñada para la optimización del entrenamiento de fuerza mediante el análisis de datos y la **gamificación**. 

Este proyecto nace de la necesidad real de los atletas de gimnasio de llevar un registro científico y motivador de sus progresos, aplicando la **sobrecarga progresiva** de forma sistemática a través de una interfaz moderna, rápida y "Mobile First".

---

## 🚀 Características Principales

### 🎮 Gamificación y Progresión
- **Sistema de Niveles y XP:** Gana experiencia con cada serie registrada y sube de rango (Novato, Pro, Leyenda...).
- **Economía Interna:** Gana monedas entrenando y gástalas en la tienda para personalizar tu perfil.
- **Rachas (Streaks):** Mantén la consistencia con el contador de rachas y protégelas con los "Escudos de Racha".

### 🧠 Inteligencia en el Entrenamiento
- **Asistente de Rutinas Inteligente:** Generador algorítmico que construye entrenamientos personalizados basados en tus objetivos (Pecho, Espalda, Full Body...).
- **Registro en Vivo:** Interfaz optimizada con cronómetros de descanso y seguimiento de volumen en tiempo real.

### 🌐 Comunidad y Social 
- **Perfiles Públicos:** Estilo red social (Instagram) donde puedes ver los logros y rutinas de otros atletas.
- **Sistema de Seguidores:** Sigue a tus amigos y visualiza su actividad en el feed de la comunidad.
- **Biblioteca de Rutinas:** Comparte tus planes de entrenamiento o guarda los de otros usuarios.

### 📊 Análisis y Estadísticas
- **Visualización de Datos:** Gráficas dinámicas de volumen total, progresión de fuerza y frecuencia de entrenamiento.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Backend** | Python 3.11 + Flask (Estructura Modular por Blueprints) |
| **Frontend** | React.js + TypeScript + Vite |
| **Estilos** | Tailwind CSS (Diseño Premium Dark Mode & Glassmorphism) |
| **Base de Datos** | MariaDB / MySQL |
| **Autenticación** | JWT (JSON Web Tokens) & Hashing de Contraseñas |
| **Infraestructura** | Docker & Docker Compose |

---

## 📦 Estructura del Proyecto

```text
GymTrackPro/
├── backend/            # API RESTful en Flask
│   ├── app/            # Lógica de negocio (Rutas, Modelos, Servicios)
│   └── Dockerfile
├── frontend/           # Aplicación SPA en React
│   ├── src/            # Componentes, Hooks, Context, API Services
│   └── Dockerfile
└── docker-compose.yml  # Orquestación de contenedores y base de datos
```

---

## 🏁 Instalación y Ejecución

Para levantar el entorno completo de desarrollo de forma automática:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/GymTrackPro.git
   cd GymTrackPro
   ```

2. **Levantar contenedores con Docker:**
   ```bash
   docker-compose up -d --build
   ```

3. **Acceder a la aplicación:**
   - **Frontend:** [http://localhost:8080](http://localhost:8080)
   - **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
   - **Administrador DB:** [http://localhost:8081](http://localhost:8081)

---

## 🛡️ Seguridad y Buenas Prácticas
- Implementación de **CORS** para comunicación segura entre dominios.
- Manejo de excepciones centralizado en el backend.
- Tipado estricto con **TypeScript** en el frontend.
- Variables de entorno protegidas para las claves de API y Secretos.

---

*Este proyecto ha sido desarrollado como Trabajo de Fin de Grado (TFG) enfocándose en la excelencia técnica y la experiencia de usuario.* 🚀🦾
