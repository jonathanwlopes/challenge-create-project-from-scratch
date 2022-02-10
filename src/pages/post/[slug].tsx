import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle?: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const formattedPost = {
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  const [dataPost] = useState(formattedPost);

  console.log(dataPost);

  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const numberWords = post.data.content.reduce((acc, content) => {
    const removeSpaceRegex = /\s/;

    const wordsHeading = content.heading.split(removeSpaceRegex).length;

    const wordsBody = content.body.reduce((accBody, body) => {
      const total = body.text.split(removeSpaceRegex).length;

      return accBody + total;
    }, 0);

    return acc + wordsHeading + wordsBody;
  }, 0);

  const readingTime = Math.ceil(numberWords / 200);

  return (
    <>
      <Head>
        <title>{`${dataPost.data.title} | spacetraveling`} </title>
      </Head>
      <main className={styles.container}>
        <div className={styles.headerContainer}>
          <Header />
        </div>
        <div className={styles.bannerContainer}>
          <img
            src={dataPost.data.banner.url}
            alt="banner"
            className={styles.bannerImage}
          />
        </div>

        <section className={styles.center}>
          <div className={styles.postContainer}>
            <strong className={styles.postTitle}>{dataPost.data.title}</strong>
            <div className={styles.rowWrapper}>
              <div className={styles.infoWrapper}>
                <FiCalendar />
                <p className={styles.infoWrapperData}>
                  {dataPost.first_publication_date}
                </p>
              </div>
              <div className={styles.infoWrapper}>
                <FiUser />
                <p className={styles.infoWrapperText}>{dataPost.data.author}</p>
              </div>
              <div className={styles.infoWrapper}>
                <FiClock />
                <p className={styles.infoWrapperText}>{`${readingTime} min`}</p>
              </div>
            </div>
          </div>

          {post.data.content.map((content, index) => (
            <div key={index} className={styles.postContent}>
              <h2 className={styles.postContentTitle}>{content.heading}</h2>
              {content.body.map((body, i) => (
                <p key={i} className={styles.postContentText}>
                  {body.text}
                </p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response: PostProps['post'] = await prismic.getByUID(
    'post',
    String(slug),
    {}
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
