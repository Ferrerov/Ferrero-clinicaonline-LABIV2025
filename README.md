# 🏥 Clinica Online

La Clinica Online es una aplicación web para la gestión de turnos, pacientes, historias clínicas y especialistas de la salud. Desarrollada con Angular 19 y Supabase como backend, permite a pacientes, especialistas y administradores interactuar en la plataforma.

## 🚀 Características principales

- Registro y autenticacion de usuarios (paciente, especialista, administrador)
- Asignacion y gestion de turnos
- Carga y visualizacion de historias clinicas
- Comentarios y reseñas sobre la atencion recibida
- Gestion de horarios personalizados por especialidad
- Panel de administrador con control sobre usuarios y turnos

## 👥 Roles de usuarios

### 👤 Paciente
- Solicita turnos con especialistas segun la especialidad
- Puede cancelar y calificar turnos
- Visualiza su historia clinica

### 🩺 Especialista
- Configura sus horarios por especialidad
- Acepta o rechaza turnos
- Carga la historia clinica
- Accede a los pacientes que atendio

### 🛠️ Administrador
- Visualiza todos los turnos del sistema
- Gestiona usuarios y sus permisos

## 🔄 Como funciona

0. **Bienvenida**
   - Pantalla de bienvenida
![Bienvenida](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Bienvenida.PNG)

1. **Registro / Login**  
   - El usuario se registra como paciente o especialista
![Registro](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Registro.PNG)

   - Registro del paciente
![Registro del paciente](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Registro%20Paciente.PNG)

   - Registro del especialista
![Registro del especialista](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Registro%20Especialista.PNG)

2. **Solcitar turnos**
   - El paciente elige especialidad, especialista, día y horario disponible
   - Se genera un turno en estado 'PENDIENTE'
   - Registro del paciente
![Solicitar turno](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Solicitar%20Turno.PNG)   

3. **Gestion de turnos**
   - El especialista acepta, rechaza o finaliza el turno
![Mis turnos especialista](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Mis%20Turnos%20Especialista.PNG)
   - El paciente puede cancelar antes de que se complete
![Mis turnos paciente](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Mis%20Turnos%20Paciente.PNG)

4. **Historia clínica**
   - Al finalizar el turno, el especialista carga la reseña
![Carga de reseña](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Resena%20Especialista.PNG)

   - Luego carga los datos a la historia clinica
   - Incluye altura, peso, temperatura, presión y hasta 3 campos dinamicos
![Carga de Historia Clinica](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Historia%20Clinica.PNG)


5. **Calificacion de  la atencion**
   - El paciente puede dejar una reseña una vez que el turno ha sido completado.
![Calificar turno](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Calificacion%20del%20turno.PNG)

