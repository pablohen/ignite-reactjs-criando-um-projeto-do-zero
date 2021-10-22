import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactNode } from 'react';

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

export default function Post({ post }: PostProps) {
  // TODO
  console.log(post);
  return <h1>post</h1>;
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
