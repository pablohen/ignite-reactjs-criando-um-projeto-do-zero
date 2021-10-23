import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactElement } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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

export default function Post({ post }: PostProps): ReactElement {
  // TODO
  console.log(post);
  return (
    <main>
      <div className={commonStyles.container}>
        <Header />
      </div>
      {post.data.banner.url && (
        <img
          src={post.data.banner.url}
          alt={post.data.title}
          className={styles.banner}
        />
      )}

      <div className={commonStyles.container}>
        <div className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.dadosPost}>
            <span>
              <FiCalendar size={20} className={styles.icon} />
              {post.first_publication_date}
            </span>
            <span>
              <FiUser size={20} className={styles.icon} />
              {post.data.author}
            </span>
            <span>
              <FiClock size={20} className={styles.icon} />
              Uns minutos
            </span>
          </div>

          {post.data.content.heading}

          <div
            className=""
            dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
          />
        </div>
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const res = await prismic.getByUID('posts', String(slug), {});

  console.log(res.data.content[0]);

  const post: Post = {
    first_publication_date: res.first_publication_date,
    data: {
      title: res.data.title,
      banner: {
        url: res.data.banner.url,
      },
      author: res.data.author,
      content: {
        heading: res.data.content[0].heading,
        body: {
          text: RichText.asHtml(res.data.content[0].body),
        },
      },
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
