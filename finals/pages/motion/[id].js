import Navbar from "../../components/Navbar";
import Head from "next/head";
import styles from "../../styles/motion.module.css";
import Footer from "../../components/Footer";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const SERVER_HOST = "http://localhost:3000";

export const getStaticPaths = async () => {
  const res = await fetch(`${SERVER_HOST}/api/motion`);
  const data = await res.json();

  const paths = data.map((motion) => {
    return {
      params: {
        id: motion.id.toString(),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const id = context.params.id;
  const res = await fetch(`${SERVER_HOST}/api/motion/${id}`);
  const data = await res.json();
  return {
    props: { motion: data },
  };
};

const Details = ({ motion }) => {
  const { status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      Router.replace("/auth/login");
    }
  }, [status]);

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>MotionCPT</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main className={styles.main}>
          <Navbar />
          <div className={styles.motion}>
            {motion.map((m) => (
              <div>
                <h1 className={styles.h1}>{m.id}/Motion details</h1>
                <p className={styles.p_time}>Start time: {m.start_time}</p>
                <p className={styles.p_time}>End time: {m.end_time}</p>
                <img
                  className={styles.big_img}
                  src={`data:image/jpeg;base64,${Buffer.from(
                    m.image,
                    "base64"
                  ).toString()}`}
                  height="auto"
                  width="auto"
                />
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </>
    );
  }
};

export default Details;
