import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import styles from "../../styles/signin.module.css";
import Link from "next/link";

const signin = () => {
  const router = useRouter();
  const { status, data } = useSession();

  const [userInfo, setUserInfo] = useState({ text: "", password: "" });
  const [alert, setAlert] = useState("");

  const handleSubmit = async (e) => {
    // validate user
    e.preventDefault();

    let result = false;

    if (userInfo.text === "" || userInfo.password === "") {
      setAlert("Fill up inputs!");
      result = true;
    }

    if (!result) {
      try {
        const res = await signIn("credentials", {
          text: userInfo.text,
          password: userInfo.password,
          redirect: false,
        });

        if (!res.ok) {
          setAlert("Invalid credentials!");
        }
      } catch (error) {
        throw error;
      }
    }

    console.log(result);
  };

  if (status !== "authenticated") {
    return (
      <>
        <Head>
          <title>MotionCPT | Login</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <main className={styles.signin_div}>
          <form
            className={styles.signin_form}
            action=""
            onSubmit={handleSubmit}
          >
            <img src="/camera.svg" alt="" height={42} width={42} />

            <h1 className={styles.h1}>Welcome</h1>
            <input
              className={styles.input_text}
              type="text"
              name="text"
              id=""
              value={userInfo.email}
              placeholder="Email/Username"
              onChange={(e) => {
                setUserInfo({ ...userInfo, text: e.target.value });
              }}
            />
            <input
              className={styles.input_text}
              type="password"
              name="password"
              id=""
              value={userInfo.password}
              placeholder="Password"
              onChange={(e) => {
                setUserInfo({ ...userInfo, password: e.target.value });
              }}
            />
            <div className={styles.forgotpass_div}>
              <Link className={styles.forgotpass_link} href="/auth/forgotpass">
                Forgot password?
              </Link>
            </div>

            <input
              className={styles.signup_btn}
              type="submit"
              value="Continue"
              name="login"
              id=""
            />

            <p className={styles.p_notfound}>{alert}</p>

            <p className={styles.p}>
              Don't have an account?{" "}
              <Link className={styles.signup_link} href="/auth/signup">
                Sign up
              </Link>
            </p>
          </form>
        </main>
      </>
    );
  } else {
    router.replace("/");
  }
  return <div>Loading</div>;
};

export default signin;