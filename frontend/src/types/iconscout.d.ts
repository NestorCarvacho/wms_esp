declare module '@iconscout/react-unicons/icons/*' {
  import type { FC, SVGProps } from 'react';

  interface UniconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
  }

  const Icon: FC<UniconProps>;
  export default Icon;
}
