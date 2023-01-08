export default function Disclaimer() {
  return (
    <div className="rounded dark:shadow-none shadow-md px-4 py-2 mt-6 border flex prose">
      <div>
        I'm not an expert on this topic. If you find an error or want to correct
        me in another way, please{" "}
        <a
          className="outline-offset-1 outline-skin-fill outline-2 focus-visible:outline-dashed focus-visible:no-underline"
          href="https://github.com/flexwie/homepage/issues/new?assignees=flexwie&labels=&template=correction.md&title=%5BCORRECTION%5D"
        >
          open an issue!
        </a>
      </div>
    </div>
  );
}
