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


6. **Descargar historia clinica**
   - El paciente puede descargar su historia clinica completa.
![Descargar historia](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Descarga%20Historia%20Paciente.PNG)


7. **Ver historias clinicas y turnos del paciente**
   - El especialista puede ver loss turnos e historias clinicas de pacientes que haya atendido alguna vez.
   Primero selecciona el usuario que haya atendido.
![Seleccionar Paciente](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Pacientes%20Seleccion.PNG)
   Luego puede ver los turnos e historias de dicho paciente, seleccionando el turno que corresponda.
![Ver turnos paciente](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Pacientes%20Turnos.PNG)


8. **Ver historias de todos**
   - Como administrador, se puden ver todas las historias clinicas existentes.
![Ver historia admin](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Usuarios%20Historia.PNG)


9. **Descarga de turnos de pacientes**
   - Como administrador, se puden descargar los datos de los turnos de los pacientes.
![Descarga turnos](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Usuarios%20Descargar%20Seleccion.PNG)


10. **Informes de la Clinica**
   - Como administrador, se puede acceder a informes y estadisticas.
   Por ejemplo, un informe de los logs de ingresos:
![Informe Ingresos](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Informes%20Ingresos.PNG)
   Otro ejemplo, graficos de turnos solicitados:
![Informe Turnos](https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/capturas/Informes%20Turnos%20Solicitados.PNG)

