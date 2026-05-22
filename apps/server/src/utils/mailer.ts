import nodemailer from "nodemailer"

// Local Mailhog configuration
export const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false, // true for 465, false for other ports
})

export const sendMagicLink = async (
  email: string,
  token: string,
  host: string
) => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const magicLink = `${protocol}://${host}/api/auth/verify?token=${token}`

  await transporter.sendMail({
    from: '"BlazeCrawl" <auth@blazecrawl.com>',
    to: email,
    subject: "Your Login Link",
    text: `Click here to login: ${magicLink}`,
    html: `<p>Click <a href="${magicLink}">here</a> to login to BlazeCrawl.</p>`,
  })
}
