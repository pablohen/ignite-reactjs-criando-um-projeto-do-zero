import Link from 'next/link';
import { ReactElement } from 'react';
import styles from './header.module.scss';

const Header = (): ReactElement => {
  return (
    <Link href="/" passHref>
      <a>
        <img src="/Logo.svg" alt="logo" className={styles.logo} />
      </a>
    </Link>
  );
};

export default Header;
