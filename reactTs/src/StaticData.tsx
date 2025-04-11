import { RawNote } from "./App";
import { v4 as uuidV4 } from "uuid";

const infoTag = { id: uuidV4(), label: "Info" };
const conceptsTag = { id: uuidV4(), label: "Concepts" };

export const staticData: RawNote[] = [
  {
    id: uuidV4(),
    title: "Project Description",
    markdown: `## React Notes App
  
  A fully-featured Note-taking App built with **React** and **Typescript**, combining the simplicity of a classic To-Do list with powerful enhancements like:
  
  - Create / Read / Update / Delete (CRUD) notes and tags  
  - Markdown Support for rich text formatting  
  - LocalStorage Persistence to save notes in the browser  
  
  ---
  
  ### Tech Stack
  
  - React 
  - TypeScript 
  - React Router v6 
  - React Bootstrap
  - React-Select + Creatable
  - UUID for unique note IDs  
  - React Markdown for rendering markdown safely`,
    tagIds: [infoTag.id],
  },
  {
    id: uuidV4(),
    title: "Hooks",
    markdown: `This project makes use of several built-in and custom React hooks to manage state, side effects, routing, and local storage efficiently.
  
  ### Hooks Used
  
  - \`useState\` – for managing component-level state 
  - \`useRef\` – for referencing DOM elements and storing mutable values
  - \`useEffect\` – to handle side effects like fetching or syncing data  
  - \`useMemo\` – for memoizing computed values to optimize performance  
  - \`useNavigate\` – for programmatic navigation using React Router v6  
  - \`useParams\` – to access route parameters from the URL  
  - \`useOutletContext\` – for shared state and global access across components  
  - \`useLocalStorage\` – a custom hook to persist state in localStorage`,
    tagIds: [infoTag.id, conceptsTag.id],
  },
  {
    id: uuidV4(),
    title: "Routing",
    markdown: `## React Router v6
  
  The app uses React Router v6 for client-side routing. Each note has a unique URL and routes are nested for better structure and layout control.`,
    tagIds: [infoTag.id, conceptsTag.id],
  },
];

export const staticTags = [infoTag, conceptsTag];
