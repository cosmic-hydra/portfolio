"""Compose personal chapters into the existing portfolio without replacing its layout."""
from pathlib import Path
from bs4 import BeautifulSoup


def fragment(path):
    return BeautifulSoup(path.read_text(), 'html.parser')


def enrich(root):
    page = root / 'src/portfolio.html'
    s = BeautifulSoup(page.read_text(), 'html.parser')
    s.html['data-soul-version'] = '1'
    for node in s.select('.soul-hero-metadata, .soul-hero-card, .soul-about-links, #throughline'):
        node.decompose()

    card = fragment(root / 'src/soul-card.html').select_one('[data-soul-card]')
    card['id'] = 'identity'
    old = s.select_one('.resource-wrapper') or s.select_one('[data-soul-card]')
    if old:
        old.replace_with(card)
    else:
        s.select_one('#services').insert_before(card)

    hero = s.select_one('.willem-header__content')
    hero.append(fragment(root / 'src/soul-hero.html'))
    heading = s.select_one('.mwg046-sentence')
    heading.clear()
    heading.append('AI, capital and science. Built by ')
    name = s.new_tag('em')
    name.string = 'Advaith.'
    heading.append(name)
    for image in s.select('.willem__cover-image'):
        image['loading'] = 'eager'
        image['fetchpriority'] = 'high'

    for a in s.select('.willem-nav__link'):
        if a.get('href') == '#services':
            a['href'] = '#identity'
            a.string = 'The card'
        if a.get('href') == '#process':
            a.string = 'Approach'
    for a in s.select('.bold-nav-full__link'):
        a['data-navigation-toggle'] = 'close'
        if a.get('href') == '#services':
            a['href'] = '#identity'
            label = a.select_one('.bold-nav-full__link-text')
            if label: label.string = 'The card'
        if a.get('href') == '#process':
            label = a.select_one('.bold-nav-full__link-text')
            if label: label.string = 'Approach'

    about = s.select_one('#about .u-h3')
    about.clear()
    about.append('I’m Advaith. I follow questions across AI, capital and science—and build what I find.')
    about.append(s.new_tag('br'))
    about.append(s.new_tag('br'))
    about.append('From teams of AI agents to the stars above us and the molecules within us. Curiosity is the throughline.')
    about.parent.append(fragment(root / 'src/soul-about.html'))
    for i, node in enumerate(s.select('.c-marquee-horizontal_cms_text')):
        node.string = ['A curious mind', 'A builder’s hands', 'AI × Capital × Science', 'Jack of all trades', 'One life. Many worlds.'][i % 5]

    project_ids = ['artificial-hedge', 'ctxt-mam', 'speedx', 'zane', 'space4climate']
    for panel, identifier in zip(s.select('.case-content'), project_ids):
        panel['id'] = 'project-' + identifier
    for a, identifier in zip(card.select('.soul-card-disciplines a'), ['ctxt-mam', 'artificial-hedge', 'speedx', 'zane', 'space4climate']):
        a['href'] = '#project-' + identifier
    before_process = s.select('.mwg032')[-1]
    before_process.insert_before(fragment(root / 'src/soul-manifesto.html').section)

    # The footer interaction deals our own illustrated cards.
    for widget in s.select('.emoji-rain-btn'):
        button = s.new_tag('button', attrs={'type': 'button', 'class': 'soul-deal-btn', 'aria-label': 'Deal a little curiosity: animate playing cards'})
        button.append('Deal a little curiosity ')
        plus = s.new_tag('span', attrs={'aria-hidden': 'true'})
        plus.string = '+'
        button.append(plus)
        widget.replace_with(button)
    for script in s.find_all('script'):
        value = script.string or ''
        if 'initEmojiRain' in value:
            script.decompose()
        if 'delay: 4.5' in value and '.mwg046-sentence' in value:
            script.string = value.replace('delay: 4.5', 'delay: 3.25')
        if 'const lenis = new Lenis' in value and 'window.portfolioLenis' not in value:
            script.string = (script.string or value).replace('autoRaf: true\n});', 'autoRaf: true\n});\nwindow.portfolioLenis = lenis;')
    for label in s.select('.mwg044-footer_bot .u-copy'):
        if label.get_text(strip=True) == 'advvvvaith':
            label.string = 'Made with curiosity. And heart.'

    result = str(s).replace('viewbox=', 'viewBox=').replace('<clippath ', '<clipPath ').replace('</clippath>', '</clipPath>')
    page.write_text(result)
    print('Added the personal card, story, manifesto and project anchors.')


if __name__ == '__main__':
    enrich(Path(__file__).resolve().parents[1])
