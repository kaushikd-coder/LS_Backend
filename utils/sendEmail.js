import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 456,
        service: "gmail",
        auth: {
            user: "locastorev1@gmail.com",
            pass: "dwtbgyzjmyvrlmnv",
        },
    })

    const mailOptions = {
        from: "locastorev1@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;