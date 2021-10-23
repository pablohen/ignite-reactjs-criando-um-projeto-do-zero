import { ReactNode, useState } from 'react';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  slug: string;
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

const Home = ({ postsPagination }: HomeProps): ReactNode => {
  const [newPosts, setNewPosts] = useState<Post[]>([]);

  const handleFetchNextPage = async (): Promise<void> => {
    const data = await fetch(postsPagination.next_page).then(res => res.json());

    console.log(data);
  };

  return (
    <main className={commonStyles.container}>
      <Header />

      {postsPagination.results.map(post => (
        <div className={styles.post} key={post.uid}>
          <Link href={`/post/${post.slug}`} passHref>
            <a>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div>
                <span>
                  <FiCalendar size={20} className={styles.icon} />
                  {post.first_publication_date}
                </span>
                <span>
                  <FiUser size={20} className={styles.icon} />
                  {post.data.author}
                </span>
              </div>
            </a>
          </Link>
        </div>
      ))}

      {postsPagination.next_page && (
        <button
          type="button"
          onClick={handleFetchNextPage}
          className={styles.loadMore}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.uid', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  // console.log(postsResponse);

  const results = postsResponse.results.map(post => {
    console.log(post.slugs[0]);
    return {
      uid: post.uid,
      slug: post.slugs[0],
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const { next_page } = postsResponse;

  const postsPagination = {
    next_page,
    results,
  };

  // console.log(postsPagination);

  return {
    props: {
      postsPagination,
    },
  };
};

export default Home;
