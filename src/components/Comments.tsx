import React from 'react';

interface Props {}

const Comments = (props: Props) => {
  return (
    <script
      src="https://utteranc.es/client.js"
      repo="pablohen/ignite-reactjs-criando-um-projeto-do-zero"
      issue-term="pathname"
      theme="preferred-color-scheme"
      crossOrigin="anonymous"
      async
    />
  );
};

export default Comments;
