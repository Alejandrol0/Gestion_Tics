import nodemailer from "nodemailer";

// Email para notificar aprobación/rechazo de curso (ÚNICA función que queda)
export const emailEstadoCurso = async (datos) => {
    const { email, nombre, tituloCurso, estado, comentarios } = datos;
    

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mensaje = '';
    if (estado === 'aprobado') {
        mensaje = `
            <p>¡Felicidades ${nombre}!</p>
            <p>Tu curso "${tituloCurso}" ha sido APROBADO por el coordinador.</p>
            <p>Ya puedes publicar el curso para que los aprendices se inscriban.</p>
        `;
    } else if (estado === 'rechazado') {
        mensaje = `
            <p>Hola ${nombre},</p>
            <p>Tu curso "${tituloCurso}" ha sido RECHAZADO por el coordinador.</p>
            <p>Comentarios: ${comentarios || 'No se proporcionaron comentarios'}</p>
            <p>Puedes modificar el curso y enviarlo nuevamente para revisión.</p>
        `;
    }

    await transport.sendMail({
        from: '"Gestión de Cursos - Estado de Curso" <cursos@cursos.com>',
        to: email,
        subject: `Tu curso ha sido ${estado === 'aprobado' ? 'APROBADO' : 'RECHAZADO'}`,
        html: mensaje,
    });

    console.log(`📧 Notificación a ${email}: Curso "${tituloCurso}" - Estado: ${estado}. Comentarios: ${comentarios || 'Ninguno'}`);
};