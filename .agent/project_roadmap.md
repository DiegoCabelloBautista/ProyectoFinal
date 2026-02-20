# 📊 GymTrack Pro - Roadmap de Desarrollo

## ✅ Estado Actual (Implementado)

### Backend (Flask + MariaDB)
- ✅ **Sistema de Autenticación** (JWT)
  - Registro de usuarios
  - Login
  - Protección de rutas
- ✅ **CRUD de Rutinas**
  - Crear rutinas con ejercicios
  - Listar rutinas del usuario
  - Eliminar rutinas
- ✅ **Gestión de Ejercicios**
  - Listar ejercicios
  - Filtrar por grupo muscular
- ✅ **Sistema de Sesiones**
  - Iniciar sesión de entrenamiento
  - Finalizar sesión
  - Registro de series (peso, reps, RPE)

### Frontend (React + TypeScript + Tailwind)
- ✅ **Autenticación UI**
  - Login con diseño premium
  - Registro de usuarios
  - Context API para auth
- ✅ **Dashboard**
  - Gráficas de progreso (básicas)
  - Tarjetas de estadísticas
  - Navegación bottom nav responsive
- ✅ **Gestión de Rutinas**
  - Lista de rutinas
  - Constructor de rutinas
  - Logger de entrenamientos

### Infraestructura
- ✅ **Docker Compose**
  - MariaDB containerizado
  - Backend Flask containerizado
  - Frontend React containerizado

---

## 🎯 MVP - Funcionalidades Pendientes (Prioridad ALTA)

### 1. **Motor de Visualización de Datos** 🔥 [CRÍTICO]
**Descripción**: El chart actual es estático. Necesitas gráficas dinámicas con datos reales.

**Backend**:
- [ ] Endpoint `GET /api/analytics/volume` - Volumen por grupo muscular
- [ ] Endpoint `GET /api/analytics/progression` - Progresión de cargas por ejercicio
- [ ] Endpoint `GET /api/analytics/sessions-summary` - Resumen temporal de sesiones

**Frontend**:
- [ ] Integrar **Recharts** o **Chart.js**
- [ ] Componente `VolumeChart` - Gráfica de volumen semanal/mensual
- [ ] Componente `ProgressionChart` - Evolución de 1RM estimado
- [ ] Página `/analytics` completa con múltiples visualizaciones

**Estimación**: 3-4 días  
**Impacto**: 🔥🔥🔥 (Funcionalidad core del proyecto)

---

### 2. **Detalles de Rutina con Ejercicios** 🔥 [ALTO]
**Descripción**: Falta el endpoint para ver el detalle completo de una rutina con sus ejercicios.

**Backend**:
- [ ] Endpoint `GET /api/routines/<id>` - Detalle de rutina con ejercicios y metadata

**Frontend**:
- [ ] Vista de detalle de rutina antes de iniciar sesión
- [ ] Mostrar ejercicios, series, reps planificadas

**Estimación**: 1 día  
**Impacto**: 🔥🔥 (Necesario para flujo de usuario)

---

### 3. **Historial de Sesiones Detallado** 🔥 [ALTO]
**Descripción**: Actualmente puedes ver sesiones, pero no los logs detallados.

**Backend**:
- [ ] Endpoint `GET /api/workouts/sessions/<id>` - Detalle de sesión con logs
- [ ] Incluir cálculos: volumen total, PR detectado, tiempo de sesión

**Frontend**:
- [ ] Página `/session/<id>` con timeline de ejercicios
- [ ] Mostrar peso x reps de cada serie
- [ ] Destacar PRs (nuevos records personales)

**Estimación**: 2 días  
**Impacto**: 🔥🔥 (Clave para motivación del usuario)

---

### 4. **Mejoras en WorkoutLogger** 🔥 [MEDIO-ALTO]
**Descripción**: Mejorar la experiencia durante el entrenamiento.

**Frontend**:
- [ ] Timer de descanso entre series (cuenta regresiva)
- [ ] Mostrar peso/reps de la última sesión para cada ejercicio
- [ ] Validación de inputs (peso/reps no negativos)
- [ ] Botón "Repetir última serie" (auto-fill)
- [ ] Progress bar (ejercicios completados / totales)

**Estimación**: 2 días  
**Impacto**: 🔥🔥 (UX crítica para uso real en gimnasio)

---

## 🚀 Features Extra (Prioridad MEDIA)

### 5. **Calculadora de 1RM** 📊 [MEDIO]
**Fórmula**: 1RM = Peso × (1 + Reps/30) (Fórmula de Epley)

**Backend**:
- [ ] Función helper en `models.py` para calcular 1RM
- [ ] Endpoint `GET /api/analytics/1rm?exercise_id=X` - Historial de 1RM estimado

**Frontend**:
- [ ] Componente `OneRMCalculator` con input manual
- [ ] Dashboard: Mostrar 1RM real (calculado desde logs) en `StatCard`
- [ ] Gráfica de evolución de 1RM por ejercicio

**Estimación**: 2 días  
**Impacto**: 🔥 (Muy atractivo para usuarios avanzados)

---

### 6. **Historial de Medidas Corporales** 📏 [MEDIO]
**Descripción**: Seguimiento de peso corporal, % grasa, perímetros.

**Backend**:
- [ ] Modelo `BodyMeasurement` (user_id, date, weight, body_fat, chest, waist, etc.)
- [ ] CRUD completo: `POST /api/measurements`, `GET /api/measurements`

**Frontend**:
- [ ] Formulario de ingreso de medidas
- [ ] Gráfica de evolución de peso corporal
- [ ] Tabla de historial con fechas

**Estimación**: 2 días  
**Impacto**: 🔥 (Complementa bien el análisis de rendimiento)

---

### 7. **Exportación de Datos** 📄 [MEDIO-BAJO]
**Descripción**: Permitir al usuario descargar sus datos.

**Backend**:
- [ ] Endpoint `GET /api/export/sessions?format=csv` - CSV de sesiones
- [ ] Endpoint `GET /api/export/report?format=pdf` - PDF con resumen mensual

**Frontend**:
- [ ] Botón "Exportar a CSV" en página de análisis
- [ ] Generación de PDF con gráficas (usando jsPDF + html2canvas)

**Estimación**: 2-3 días  
**Impacto**: ⭐ (Nice to have, no crítico)

---

### 8. **Temporizador de Descanso Integrado** ⏱️ [MEDIO]
**Descripción**: Timer que suena al finalizar el descanso.

**Frontend**:
- [ ] Componente `RestTimer` con cuenta regresiva configurable
- [ ] Notificación sonora al terminar (Web Audio API)
- [ ] Configuración por defecto (ej: 90s entre series)
- [ ] Integración en `WorkoutLogger`

**Estimación**: 1 día  
**Impacto**: 🔥 (Muy útil para UX en gimnasio)

---

### 9. **Sistema de Notificaciones** 🔔 [BAJO]
**Descripción**: Recordatorios de entrenamiento.

**Backend**:
- [ ] Modelo `Notification` (user_id, message, read, created_at)
- [ ] Endpoint `GET /api/notifications`

**Frontend**:
- [ ] Badge en icono de campana con contador
- [ ] Modal de notificaciones
- [ ] Marcar como leídas

**Estimación**: 2 días  
**Impacto**: ⭐ (No crítico pero profesional)

---

### 10. **Perfil de Usuario Completo** 👤 [BAJO]
**Descripción**: Editar información personal.

**Backend**:
- [ ] Endpoint `PUT /api/users/profile` - Actualizar perfil
- [ ] Campos adicionales: altura, edad, objetivo (fuerza/hipertrofia)

**Frontend**:
- [ ] Página `/profile` con formulario de edición
- [ ] Upload de avatar (opcional con Cloudinary)
- [ ] Configuración de preferencias (unidades: kg/lbs)

**Estimación**: 2 días  
**Impacto**: ⭐ (Mejora el aspecto profesional)

---

## 🏗️ Infraestructura y Deployment (Objetivo Final)

### 11. **Despliegue Automatizado** 🚢 [CRÍTICO al final]
**Descripción**: Producción real con Nginx + Docker en servidor remoto.

- [ ] Configurar Nginx como reverse proxy
- [ ] SSL con Let's Encrypt (Certbot)
- [ ] CI/CD con GitHub Actions (opcional)
- [ ] Variables de entorno de producción
- [ ] Backup automático de base de datos

**Estimación**: 2-3 días  
**Impacto**: 🔥🔥🔥 (Requisito para "proyecto final")

---

## 📝 Recomendación de Orden de Implementación

### **Fase 1: Completar MVP (2-3 semanas)**
1. Motor de visualización de datos (gráficas reales)
2. Detalle de rutinas
3. Historial de sesiones detallado
4. Mejoras en WorkoutLogger (timer, últimas marcas)

### **Fase 2: Features Extra de Alto Valor (1-2 semanas)**
5. Calculadora de 1RM
6. Temporizador de descanso integrado
7. Historial de medidas corporales

### **Fase 3: Polish y Deployment (1 semana)**
8. Exportación de datos (CSV)
9. Perfil de usuario completo
10. Despliegue en producción con Nginx

### **Fase 4: Opcional (según tiempo)**
11. Notificaciones
12. Exportación a PDF
13. PWA (Progressive Web App) para instalación en móvil

---

## 🎨 Mejoras de UX/UI Sugeridas

- [ ] **Loading states** en todas las requests (skeletons)
- [ ] **Animaciones** con Framer Motion (transiciones entre páginas)
- [ ] **Modo offline** (guardado local con IndexedDB si no hay red)
- [ ] **Validación de formularios** con react-hook-form + Zod
- [ ] **Toasts de feedback** (react-hot-toast) para acciones exitosas/fallidas
- [ ] **PWA** - Service Worker para funcionamiento offline
- [ ] **Dark/Light mode toggle** (opcional, ya tienes dark mode por defecto)

---

## 💡 Funcionalidades "Wow Factor" para Impresionar

### 🏆 **Detección automática de PRs (Personal Records)**
En el dashboard, resaltar ejercicios donde el usuario ha superado su récord histórico (peso máximo levantado o volumen máximo).

### 📈 **Predicción de progresión con IA**
Usar una regresión lineal simple con los datos históricos para predecir "cuándo alcanzarás X kg en ejercicio Y".

### 🎯 **Heatmap de frecuencia de entrenamiento**
Calendario visual (tipo GitHub contributions) mostrando días entrenados.

### 📊 **Comparativa de volumen por grupo muscular**
Gráfica de radar/spider chart mostrando si hay desbalances (ej: mucho volumen en pecho, poco en espalda).

---

## ⚡ Resumen Ejecutivo

**Para tener un MVP completo y profesional, enfócate en:**
1. **Gráficas dinámicas con datos reales** (sin esto, no es un "analítica de datos")
2. **Historial detallado de sesiones** (para ver el progreso)
3. **UX del WorkoutLogger** (debe ser impecable para uso real)
4. **Cálculo de 1RM** (muy atractivo visualmente)
5. **Deployment en producción** (requisito para que sea un "proyecto desplegado")

Con estas 5 características bien pulidas, tendrás un proyecto **sólido, funcional y visualmente impresionante** para presentar como proyecto final. 🚀
