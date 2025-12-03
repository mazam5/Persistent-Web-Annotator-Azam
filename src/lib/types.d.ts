interface Note {
  id: string;
  url: string;
  content: string;
  domLocator: string;
  createdAt: number;
}

interface HybridLocator {
  cssPath: string;
  textSnippet: {
    before: string;
    selected: string;
    after: string;
  };
}
