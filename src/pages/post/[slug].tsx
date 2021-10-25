import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import wordsCount from 'words-count';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import formatDate from '../../utils/formatDate';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  prevPost;
  nextPost;
}

export default function Post({
  post,
  prevPost,
  nextPost,
}: PostProps): ReactElement {
  const router = useRouter();
  // const { slug } = router.query;
  // const utterances = useUtterances(String(slug));
  // console.log(utterances);
  const [words, setWords] = useState('');
  const postRef = useRef<HTMLDivElement>();
  // TODO
  // console.log(post);
  // console.log(post.data.content.body);

  const readingTime = (): string => {
    const time = Math.ceil(wordsCount(words) / 200);

    return `${time} min`;
  };

  useEffect(() => {
    if (postRef.current) {
      setWords(postRef.current.innerHTML.replace(/<[^>]*>/g, ''));
    }
  }, [postRef]);
  return (
    <main>
      <div className={commonStyles.container}>
        <Header />
      </div>

      {router.isFallback ? (
        <div>Carregando...</div>
      ) : (
        <>
          {post.data.banner.url && (
            <img
              src={post.data.banner.url}
              alt={post.data.title}
              className={styles.banner}
            />
          )}

          <div className={commonStyles.container} ref={postRef}>
            <div className={styles.post}>
              <h1>{post.data.title}</h1>

              <div className={styles.dadosPost}>
                <span>
                  <FiCalendar size={20} style={{ marginRight: '8px' }} />
                  {formatDate(
                    post.first_publication_date,
                    post.last_publication_date
                  )}
                </span>
                <span>
                  <FiUser size={20} style={{ marginRight: '8px' }} />
                  {post.data.author}
                </span>
                <span>
                  <FiClock size={20} style={{ marginRight: '8px' }} />
                  {readingTime()}
                </span>
              </div>

              {post.data.content.map(content => (
                <div key={content.heading} className={styles.content}>
                  <h2>{content.heading}</h2>

                  <div
                    className="block"
                    dangerouslySetInnerHTML={{
                      __html: content.body,
                    }}
                  />
                </div>
              ))}
            </div>

            <hr />

            <div className={styles.postLinks}>
              <div>
                {!!prevPost && (
                  <Link href={`/post/${prevPost.uid}`} passHref>
                    <a>
                      <div>
                        <p className={styles.postTitle}>
                          {prevPost.data.title}
                        </p>
                        <p className={styles.description}>Post anterior</p>
                      </div>
                    </a>
                  </Link>
                )}
              </div>
              <div>
                {!!nextPost && (
                  <Link href={`/post/${nextPost.uid}`} passHref>
                    <a>
                      <div>
                        <p className={styles.postTitle}>
                          {nextPost?.data?.title}
                        </p>
                        <p className={styles.description}>Próximo post</p>
                      </div>
                    </a>
                  </Link>
                )}
              </div>
            </div>

            <Comments />
          </div>
        </>
      )}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return { params: { slug: post.slugs[0] } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const res = await prismic.getByUID('posts', String(slug), {});

  const nextResponse = await prismic.query(
    // Replace `article` with your doc type
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: res?.id,
      orderings: '[document.first_publication_date desc]',
    }
  );
  const prevResponse = await prismic.query(
    // Replace `article` with your doc type
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: res?.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = nextResponse?.results[0] || null;
  const prevPost = prevResponse?.results[0] || null;

  const content = res.data.content.map(contentItem => {
    const body = RichText.asHtml(contentItem.body);

    const formattedContent = {
      heading: contentItem.heading,
      body,
    };
    return formattedContent;
  });

  const post: Post = {
    first_publication_date: res.first_publication_date,
    last_publication_date: res.last_publication_date,
    data: {
      title: res.data.title,
      banner: {
        url: res.data.banner.url,
      },
      author: res.data.author,
      content,
    },
  };

  return {
    props: {
      post,
      prevPost,
      nextPost,
    },
    revalidate: 60 * 60 * 24,
  };
};
