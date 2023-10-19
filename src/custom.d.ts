declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>; // eslint-disable-line no-undef
  export default content;
}
