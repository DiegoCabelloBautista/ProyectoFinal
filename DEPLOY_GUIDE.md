# Guía de Despliegue: GymTrack Pro 🚀

Esta guía detalla los pasos necesarios para desplegar tu proyecto de TFG utilizando **Vercel** (Frontend), **Render** (Backend) y **Aiven** (Base de Datos).

## 1. Base de Datos (Aiven) 🗄️

Aiven es excelente para bases de datos administradas. Como tu proyecto usa MySQL (`pymysql`), sigue estos pasos:

1.  Crea una cuenta en [Aiven.io](https://aiven.io/).
2.  Crea un nuevo servicio de **MySQL**. El plan gratuito es suficiente para un TFG.
3.  Una vez creado, copia la **Service URI** (se ve algo como `mysql://user:password@host:port/defaultdb`).
4.  **Importante**: Para que Render pueda conectar, asegúrate de añadir `0.0.0.0/0` a la lista de IPs permitidas (Allow List) en Aiven, o usa el modo de acceso público.
5.  Para migrar tus datos actuales:
    *   Exporta tu base de datos local: `mysqldump -u root -p gymtrack_pro > backup.sql`
    *   Importa a Aiven usando un cliente como DBeaver o la consola de Aiven.

## 2. Backend (Render) ⚙️

Render detectará automáticamente tu `backend/requirements.txt` y el `backend/Procfile`.

1.  Crea un nuevo **Web Service** en Render.
2.  Conecta tu repositorio de GitHub.
3.  Configura los siguientes campos:
    *   **Root Directory**: `backend`
    *   **Environment**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn "app:create_app()"`
4.  Añade las siguientes **Environment Variables**:
    *   `DATABASE_URL`: La URI que copiaste de Aiven.
    *   `SECRET_KEY`: Una cadena aleatoria segura.
    *   `JWT_SECRET_KEY`: Otra cadena aleatoria segura.
    *   `CORS_ALLOWED_ORIGINS`: La URL que te dará Vercel (ej: `https://gymtrack-pro.vercel.app`).
    *   `PYTHON_VERSION`: `3.9.0` (o la que uses localmente).

## 3. Frontend (Vercel) 🎨

Vercel es perfecto para aplicaciones Vite.

1.  Crea un nuevo proyecto en Vercel.
2.  Conecta tu repositorio de GitHub.
3.  Configura los campos:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  Añade la **Environment Variable**:
    *   `VITE_API_URL`: La URL de tu backend en Render seguida de `/api` (ej: `https://gymtrack-backend.onrender.com/api`).

---

### Notas Finales 📝
*   **CORS**: He modificado `backend/app/__init__.py` para que acepte los dominios configurados en `CORS_ALLOWED_ORIGINS`.
*   **Rutas**: He añadido `frontend/vercel.json` para que las rutas de React funcionen correctamente al recargar la página.
*   **API**: El frontend ahora usa `import.meta.env.VITE_API_URL` para saber a dónde enviar las peticiones.
*   **Persistencia**: Render tiene un sistema de archivos efímero. Esto significa que las fotos de perfil (avatares) subidas se borrarán al reiniciar o redestinar el servicio. Para un TFG es aceptable, pero para producción real deberías usar Cloudinary o AWS S3.

¡Mucha suerte con el TFG! Si tienes algún error en los logs de Render o Vercel, dímelo.
