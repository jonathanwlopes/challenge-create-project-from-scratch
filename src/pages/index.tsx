import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts] = useState<Post[]>(formattedPost);

  const [isPagination, setIsPagination] = useState<PostPagination['next_page']>(
    postsPagination.next_page
  );

  const handlePagination = () => {
    setIsPagination('2');
  };

  return (
    <>
      <main className={styles.container}>
        <div className={styles.headerContainer}>
          <Header />
        </div>

        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.postLink}>
              <div className={styles.postContainer}>
                <strong className={styles.postTitle}>{post.data.title}</strong>
                <p className={styles.postSubTitle}>{post.data.subtitle}</p>
                <div className={styles.rowWrapper}>
                  <div className={styles.infoWrapper}>
                    <FiCalendar />
                    <p className={styles.infoWrapperData}>
                      {post.first_publication_date}
                    </p>
                  </div>
                  <div className={styles.infoWrapper}>
                    <FiUser />
                    <p className={styles.infoWrapperText}>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {isPagination && (
          <button
            type="button"
            className={styles.buttonPagination}
            onClick={handlePagination}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
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
