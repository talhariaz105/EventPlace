import Joi from "joi";
import "dotenv/config";
import path from "path";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    CLIENT_URL: Joi.string().required().description("Client url"),
    STRIPE_SECRET_ACCESS_KEY: Joi.string()
      .required()
      .description("Stripe secret key"),
    STRIPE_PUBLISHABLE_KEY: Joi.string()
      .required()
      .description("Stripe publishable key"),
    STRIPE_WEBHOOK_SECRET: Joi.string().description("Stripe webhook secret"),
    STRIPE_REFRESH_URL: Joi.string().description(
      "Stripe refresh URL for onboarding"
    ),
    FRONTEND_URL: Joi.string().description("Frontend URL for Stripe return"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === "production",
      signed: true,
    },
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  clientUrl: envVars.CLIENT_URL,
  stripe: {
    secretKey: envVars.STRIPE_SECRET_ACCESS_KEY,
    publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
    refreshUrl:
      envVars.STRIPE_REFRESH_URL || `${envVars.CLIENT_URL}/stripe/refresh`,
    returnUrl: envVars.FRONTEND_URL || envVars.CLIENT_URL,
  },
  zoom: {
    accountId: envVars.ZOOM_ACCOUNT_ID,
    clientId: envVars.ZOOM_CLIENT_ID,
    clientSecret: envVars.ZOOM_CLIENT_SECRET,
  },
  google: {
    credentialsPath:
      envVars.GOOGLE_CREDENTIALS_PATH ||
      path.join(process.cwd(), "src", "modules", "authjson", "file.json"),
  },
};

export default config;
