import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  console.log(posts);

  return (
    <>
      <main className={styles.container}>
        <Header />
        <div className={styles.postContainer}>
          <strong className={styles.postTitle}>Como utilizar Hooks</strong>
          <p className={styles.postSubTitle}>
            Pensando em sincronização em vez de ciclos de vida.
          </p>
          <div className={styles.rowWrapper}>
            <div className={styles.infoWrapper}>
              <FiCalendar />
              <p className={styles.infoWrapperText}>15 Mar 2021</p>
            </div>
            <div className={styles.infoWrapper}>
              <FiUser />
              <p className={styles.infoWrapperText}>Joseph Oliveira</p>
            </div>
          </div>
        </div>

        <div className={styles.postContainer}>
          <strong className={styles.postTitle}>Como utilizar Hooks</strong>
          <p className={styles.postSubTitle}>
            Pensando em sincronização em vez de ciclos de vida.
          </p>
          <div className={styles.rowWrapper}>
            <div className={styles.infoWrapper}>
              <FiCalendar />
              <p className={styles.infoWrapperText}>15 Mar 2021</p>
            </div>
            <div className={styles.infoWrapper}>
              <FiUser />
              <p className={styles.infoWrapperText}>Joseph Oliveira</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    const publicationFormat = format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    );

    return {
      uid: post.uid,
      first_publication_date: publicationFormat,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
