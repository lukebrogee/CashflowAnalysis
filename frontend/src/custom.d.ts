// Allow importing plain CSS/SCSS files (including bootstrap side-effect imports)
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

// Explicitly allow importing bootstrap css as a side-effect
declare module 'bootstrap/dist/css/bootstrap.min.css';

export {};
