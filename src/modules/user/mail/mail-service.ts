// import nodemailer from 'nodemailer';
// import type SMTPTransport from 'nodemailer/lib/smtp-transport';

// class MailService {
  
//   private transporter: nodemailer.Transporter;
//   constructor() {
//     if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
//       throw new Error('SMTP configuration is missing in .env');
//     }
//     const transportConfig: SMTPTransport.Options = {
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: false, // true для 465, false для 587
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD,
//       },
//       connectionTimeout: 5000,
//       greetingTimeout: 5000,
//       socketTimeout: 5000,
//     };

//     this.transporter = nodemailer.createTransport(transportConfig);
//   }

//   async sendActivationMail(to: string, link: string) {
//     await this.transporter.sendMail( {
//       from: process.env.SMTP_USER,
//       to,
//       subject: 'Активация аккаунта на ',
//       text: '',
//       html: `
//           <div>Перейдите по ссылке:</div>
//           <a href="${link}">${link}</a>
//         `,
//     })
//   }
// }

// export default new MailService();