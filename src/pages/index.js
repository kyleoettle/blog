import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Head from "@docusaurus/Head";
import styles from "./index.module.css";

function Home() {
  const imgUrl = useBaseUrl("img/profile.jpg");
  const context = useDocusaurusContext();
  const { siteConfig = { title: "", tagline: "" } } = context;

  return (
    <>
      <Head></Head>

      <Layout
        title={`About ${siteConfig.title}`}
        description={`What is ${siteConfig.title}`}
      >
        <header className={clsx("hero hero--primary", styles.heroBanner)}>
          <div className="container">
            <div className="text--center">
              <img
                src={imgUrl}
                className={styles.profileImage}
                alt="kyleoettle profile picture"
              />
              <h1 className="hero__title">{siteConfig.tagline}</h1>
            </div>
            <div className={styles.buttons}>
              <Link className="button button--secondary button--lg" to="/blog">
                Check out my blog
              </Link>
            </div>
          </div>
        </header>
        <main></main>
      </Layout>
    </>
  );
}

export default Home;



// import React from 'react';
// import clsx from 'clsx';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';

// import styles from './index.module.css';

// function HomepageHeader() {
//   const {siteConfig} = useDocusaurusContext();
//   return (
    // <header className={clsx('hero hero--primary', styles.heroBanner)}>
    //   <div className="container">
    //     <h1 className="hero__title">{siteConfig.title}</h1>
    //     <p className="hero__subtitle">{siteConfig.tagline}</p>
    //   </div>
    // </header>
//   );
// }

// export default function Home() {
//   const {siteConfig} = useDocusaurusContext();
//   return (
//     <Layout
//       title={`Hello from ${siteConfig.title}`}
//       description="Kyle Oettle - Software Engineer Blog">
//       <HomepageHeader />
//       <main>
//         <HomepageFeatures />
//       </main>
//     </Layout>
//   );
// }