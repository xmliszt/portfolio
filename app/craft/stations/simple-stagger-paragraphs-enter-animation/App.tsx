import './styles.css';

const PARAGRAPHS: string[] = [
  `Welcome to Craft, a live playground where ideas transform into interactive experiences. This is where creativity meets code in real-time experimentation.`,
  `Craft provides a sandbox environment for developers to test animations, interactions, and design concepts without the overhead of setting up a complete project. Each station in Craft represents a focused exploration of a specific technique.`,
  `This particular station demonstrates staggered paragraph animations - a subtle yet effective way to guide the user's attention through content. Notice how each paragraph enters the viewport with a slight delay after the previous one.`,
  `The beauty of Craft lies in its simplicity. You can examine the code, understand the implementation, and immediately see the results. It's designed to inspire and educate through practical examples.`,
];

export default function App() {
  return (
    <main className='flex h-screen w-screen items-center justify-center overflow-y-auto p-24'>
      <div
        className='flex max-w-xl flex-col gap-y-6'
        style={{
          '--delay': '120ms',
        }}
      >
        <h3>Craft</h3>
        {PARAGRAPHS.map((text, idx) => (
          <p
            key={text}
            style={{
              '--index': idx,
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </main>
  );
}
