import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

const app = ({ Component, pageProps, session }) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default app;
