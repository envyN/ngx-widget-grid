import { SrcPage } from './app.po';

describe('src App', () => {
  let page: SrcPage;

  beforeEach(() => {
    page = new SrcPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
