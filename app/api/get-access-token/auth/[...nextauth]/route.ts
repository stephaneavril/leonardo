import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../../../../lib/db"; // <-- ¡Cuatro puntos!
// // Importa una librería para comparar contraseñas (la instalaremos después)
// import bcrypt from "bcrypt"; 

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // No se proporcionaron credenciales
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null; // Usuario no encontrado
        }

        // --- IMPORTANTE: Comparación de Contraseña ---
        // Aquí compararemos la contraseña ingresada con la guardada (hash)
        // Por ahora, como no tenemos hashing, lo comentamos.
        // const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash || "");
        // if (!isPasswordValid) {
        //  return null; // Contraseña incorrecta
        // }

        // --- Verificación de Usuario Activo ---
        if (!user.estaActivo) {
           console.log(`Intento de login de usuario inactivo: ${user.email}`);
           // Podrías lanzar un error específico o simplemente retornar null
           // throw new Error("USER_INACTIVE"); // Opcional: para dar feedback específico
           return null; // Usuario inactivo
        }

        // Si todo está bien, retorna el objeto de usuario para la sesión
        // Solo incluye los datos que quieres en la sesión (¡NUNCA la contraseña!)
        return {
          id: user.id,
          email: user.email,
          // Puedes añadir más campos si los necesitas en la sesión
        };
      }
    })
  ],
  // Opcional: Define páginas personalizadas si quieres
  // pages: {
  //   signIn: '/auth/signin', // Crearás esta página después
  //   // signOut: '/auth/signout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (used for email/OTP login)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // },

  // Configuración de la sesión (usaremos JWT por simplicidad)
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Necesitarás añadir esto a tus variables de entorno

  // Puedes añadir callbacks para personalizar la sesión o el token JWT si es necesario
  // callbacks: {
  //   async session({ session, token }) {
  //     if (token && session.user) {
  //       session.user.id = token.sub; // Añadir el ID del usuario a la sesión
  //     }
  //     return session;
  //   },
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.sub = user.id; // Guardar el ID en el token JWT
  //     }
  //     return token;
  //   }
  // }
});

export { handler as GET, handler as POST };