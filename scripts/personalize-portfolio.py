from pathlib import Path
from bs4 import BeautifulSoup
import json
import re
import math

root = Path(__file__).resolve().parents[1]
original = root / '.openai/source-original.html'
if not original.exists():
    original.write_text((root / 'public/mirror.html').read_text())
s = BeautifulSoup(original.read_text(), 'html.parser')
assets = root / 'public/assets/portfolio'
assets.mkdir(exist_ok=True)
linkedin = 'https://www.linkedin.com/in/advaithvaithianathan/'
github = 'https://github.com/cosmic-hydra'
email = 'wassup@advaithvaithianathan.com'

def text(el, value):
    el.clear()
    el.append(value)

def lines(el, values):
    el.clear()
    for i, value in enumerate(values):
        if i: el.append(s.new_tag('br'))
        el.append(value)

def svg(name, title, kicker, body, accent='#f84b30'):
    markup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1080">
    <defs><pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#ffffff" stroke-opacity=".06"/></pattern></defs>
    <rect width="1440" height="1080" fill="#151515"/><rect width="1440" height="1080" fill="url(#grid)"/>
    <g font-family="Arial,Helvetica,sans-serif" fill="#f5f2ed"><text x="80" y="92" font-size="22" letter-spacing="5">ADVVVVAITH / SELECTED WORK</text>
    <text x="80" y="225" font-size="86" letter-spacing="-5">{title}</text><text x="83" y="285" font-size="24" fill="#a6a6a0">{kicker}</text>{body}
    <path d="M80 975H1360" stroke="#ffffff" stroke-opacity=".2"/><text x="80" y="1025" font-size="20" fill="#a6a6a0">EXPERIMENTS BECOME SYSTEMS.</text>
    <circle cx="1330" cy="1017" r="13" fill="{accent}"/></g></svg>'''
    (assets / (name + '.svg')).write_text(markup)

graph = ''.join(f'<path d="M{175+i*180} {520+((i*91)%190)}L{175+(i+1)*180} {520+(((i+1)*91)%190)}" stroke="#f84b30" stroke-width="5"/>' for i in range(6))
graph += ''.join(f'<circle cx="{175+i*180}" cy="{520+((i*91)%190)}" r="12" fill="#f84b30"/>' for i in range(7))
svg('artificial-hedge', 'artificial hedge', 'RESEARCH / MARKETS / COMPANY BUILDING', f'''<rect x="80" y="370" width="1280" height="540" rx="18" fill="#232323"/>{graph}<text x="120" y="430" font-size="20" fill="#aaa">FROM RESEARCH TO DECISIONS</text><g font-size="20" fill="#ddd"><text x="120" y="845">DATA</text><text x="480" y="845">RESEARCH</text><text x="840" y="845">RISK</text><text x="1190" y="845">CAPITAL</text></g>''')

agent_nodes = [(180,580,'RESEARCH'),(480,445,'PLAN'),(480,720,'BUILD'),(810,580,'REVIEW'),(1160,580,'DELIVER')]
links = '<path d="M280 580L400 445M280 580L400 720M570 445L730 580M570 720L730 580M910 580H1060" fill="none" stroke="#b5b5af" stroke-width="3"/>'
nodes = ''.join(f'<rect x="{x-100}" y="{y-60}" width="200" height="120" rx="12" fill="#f0efe8"/><text x="{x}" y="{y+8}" text-anchor="middle" fill="#151515" font-size="24">{label}</text>' for x,y,label in agent_nodes)
svg('ctxt-mam', 'ctxt-MAM', 'OPEN SOURCE / MULTI-AGENT ORCHESTRATION', links+nodes+'<text x="80" y="900" font-size="24" fill="#b5b5af">Shared context. Specialized agents. Coordinated work.</text>', '#c9c8bf')

stars = ''.join(f'<circle cx="{100+(i*137)%1240}" cy="{360+(i*73)%530}" r="{1+(i%3)}" fill="#eee" opacity="{.25+(i%5)*.15}"/>' for i in range(110))
svg('speedx', 'speedX', 'ASTRONOMY / OBSERVATION METADATA / CLASSIFICATION', stars+'''<circle cx="720" cy="620" r="178" fill="none" stroke="#dfcbb1" stroke-width="2"/><circle cx="720" cy="620" r="145" fill="none" stroke="#dfcbb1" stroke-opacity=".4"/><path d="M720 380V860M480 620H960" stroke="#dfcbb1" stroke-opacity=".5"/><ellipse cx="720" cy="620" rx="102" ry="40" fill="#dfcbb1" opacity=".8" transform="rotate(-28 720 620)"/><text x="1000" y="565" font-size="22">HST ARCHIVE</text><text x="1000" y="615" font-size="22" fill="#aaa">METADATA</text><text x="1000" y="660" font-size="22" fill="#aaa">FITS FEATURES</text><text x="1000" y="705" font-size="22" fill="#aaa">RETRIEVAL</text>''', '#dfcbb1')

mol = ''
for cx,cy in [(440,595),(800,645),(1110,545)]:
    pts=[(cx+120*math.cos(i*math.pi/3),cy+120*math.sin(i*math.pi/3)) for i in range(6)]
    mol += '<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="none" stroke="#9fbbe0" stroke-width="5"/>'
    mol += ''.join(f'<circle cx="{x}" cy="{y}" r="14" fill="#9fbbe0"/>' for x,y in pts)
mol += '<path d="M560 595L680 645M920 645L990 545" stroke="#9fbbe0" stroke-width="5"/><text x="100" y="885" font-size="24" fill="#9fbbe0">TARGETS → MOLECULES → PHYSICS → SAFETY</text>'
svg('zane', 'ZANE', 'AI-NATIVE PHARMACEUTICAL RESEARCH', mol, '#9fbbe0')

svg('space4climate', 'Space4Climate', 'SPACE / CLIMATE / EDUCATION', '''<circle cx="640" cy="625" r="215" fill="#b2bdac"/><g stroke="#151515" stroke-width="3" opacity=".6"><ellipse cx="640" cy="625" rx="80" ry="215" fill="none"/><ellipse cx="640" cy="625" rx="160" ry="215" fill="none"/><path d="M425 625H855M455 515H825M455 735H825"/></g><ellipse cx="640" cy="625" rx="330" ry="100" fill="none" stroke="#d8ded2" stroke-width="3" transform="rotate(-30 640 625)"/><g transform="translate(985 420) rotate(-25)"><rect x="-35" y="-35" width="70" height="70" fill="#d8ded2"/><path d="M-145-20H-35V20H-145ZM35-20H145V20H35Z" fill="#8f9f83"/></g><text x="1030" y="685" font-size="24" fill="#b2bdac">STORIES</text><text x="1030" y="735" font-size="24" fill="#b2bdac">WORKSHOPS</text><text x="1030" y="785" font-size="24" fill="#b2bdac">EXPLORATION</text>''', '#b2bdac')

svg('overview', 'AI. Capital. Science.', 'ADVAITH VAITHIANATHAN / BENGALURU, INDIA', '''<g font-size="44"><text x="80" y="465">01 / BUILD SYSTEMS</text><text x="80" y="625">02 / ASK BETTER QUESTIONS</text><text x="80" y="785">03 / TURN RESEARCH INTO SOFTWARE</text></g><g fill="none" stroke="#f84b30" stroke-width="6"><circle cx="1210" cy="610" r="110"/><path d="M1055 610H1365M1210 455V765"/></g>''')
(assets / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#151515"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="34" fill="#f5f2ed">av</text></svg>')

title = 'advvvvaith — Advaith Vaithianathan'
description = 'Advaith Vaithianathan, an AI-native founder and builder working across applied AI, capital, scientific computing and product engineering.'
text(s.title, title)
s.select_one('meta[name="description"]')['content'] = description
for x in s.select('link[rel="icon"], link[rel="apple-touch-icon"]'):
    x['href']='/assets/portfolio/favicon.svg'; x['type']='image/svg+xml'
    x.attrs.pop('sizes',None)
s.html['data-wf-domain']='advvvvaith.local'
for x in s.select('script[type="application/ld+json"]'):
    x.string=json.dumps({'@context':'https://schema.org','@type':'Person','name':'Advaith Vaithianathan','alternateName':'advvvvaith','description':description,'email':email,'sameAs':[linkedin,github],'homeLocation':{'@type':'Place','name':'Bengaluru, India'}},ensure_ascii=False)

for selector, value in [('.willem__h1-start','advvv'),('.willem__h1-end','vaith')]:
    x=s.select_one(selector);x.clear()
    for char in value:
        letter=s.new_tag('span',attrs={'class':'willem__letter'});letter.string=char;x.append(letter)
for x in s.select('.nav-logo-wrapper a, .bold-nav-full__logo'):
    x.clear();brand=s.new_tag('span',attrs={'class':'advaith-wordmark'});brand.string='advvvvaith';x.append(brand)
    x['aria-label']='advvvvaith — back to top'
s.select_one('.bold-nav-full__hamburger')['aria-label']='Open menu'
s.select_one('.bold-nav-full__hamburger')['aria-expanded']='false'
s.select_one('.bold-nav-full__hamburger')['aria-controls']='mobile-navigation'
s.select_one('.bold-nav-full__tile')['id']='mobile-navigation'
text(s.select_one('.mwg046-sentence'),'AI, capital and science. Built by Advaith.')
lines(s.select_one('#about .u-copy-xxxs'),['Advaith Vaithianathan.','Founder. Builder. Researcher.','Bengaluru, India.','Currently building artificial hedge.'])
lines(s.select_one('#about .u-h3'),["I'm Advaith Vaithianathan, an AI-native founder and builder based in Bengaluru. I work across applied AI, quantitative systems and scientific computing.",'','From agent orchestration to astronomy and molecular discovery, I turn research into working software.'])
marquee=['AI-native builder','Founder, artificial hedge','Co-founder, Space4Climate','Scientific computing','Open-source contributor']
for i,x in enumerate(s.select('.c-marquee-horizontal_cms_text')):text(x,marquee[i%5])
for i,x in enumerate(s.select('.bold-nav__word')):text(x,['Bengaluru → Everywhere','AI / Capital / Science'][i%2])
for x in s.select('a[href="#About"]'):x['href']='#about'
for x in s.select('.bold-nav-full__link-text, .willem-nav__link'):
    if x.get_text(strip=True)=='Services':text(x,'Focus')
for old,new in [
    ('Every trick leaves evidence. Here is what remains.',"Experiments become systems. Here is what I'm building."),
    ('Behind the illusion there are three acts.','Curiosity, code and a way to measure what matters.'),
    ('Emoji Rain +','Send some sparks +')]:
    for node in s.find_all(string=True):
        if node.strip()==old:node.replace_with(new)
for x in s.select('.mwg044-header.inner p'):
    if x.get_text(strip=True)=='Process':text(x,'Selected Work')
for x in s.select('.mwg044-header.last p'):
    if x.get_text(strip=True)=='Process':text(x,'How I Work')

services=[
 ('Applied AI','Building useful AI systems with retrieval, memory and agent workflows. I care about traceable outputs, clear failure modes and software that can be evaluated.'),
 ('Quantitative Systems','Research tools for financial data, backtesting and portfolio decisions. The focus is on transparent assumptions, reproducible experiments and risk-aware thinking.'),
 ('Scientific Computing','Using computation to explore astronomy, molecules and complex research questions. From raw data to interpretable results, the work starts with a question worth answering.'),
 ('Product Engineering','Turning research into interfaces and tools people can use. I connect the model, backend and experience so an idea can become a working product.'),
 ('Open Source','Sharing experiments, improving existing tools and learning in public. Composable systems and readable code make it easier for others to build on the work.')]
for x,(name,_) in zip(s.select('.accordion_heading'),services):text(x,name)
for x,(_,desc) in zip(s.select('.accordion-content_text'),services):text(x,desc)
files=['artificial-hedge','ctxt-mam','speedx','zane','space4climate']
for x,file in zip(s.select('.mwg035-media'),files):x['src']=f'/assets/portfolio/{file}.svg';x['alt']='';x.attrs.pop('sizes',None)

projects=[
 ('artificial hedge','A research-led platform exploring markets, capital and company building. As founder, I am developing the software and research behind an AI-native approach to investing.','https://artificialhedge.co/','Explore Project ↗'),
 ('ctxt-MAM','Open-source work on teams-first multi-agent orchestration for Claude Code. A fork of oh-my-claudecode, focused on coordinating specialized agents around shared tasks.','https://github.com/cosmic-hydra/ctxt-MAM','View Repository ↗'),
 ('speedX','Astronomy tooling for Hubble observation metadata, FITS image features and retrieval-augmented classification. Exploring how machine learning can make scientific archives more useful.','https://github.com/cosmic-hydra/speedX','View Repository ↗'),
 ('ZANE','An AI-native pharmaceutical operating system bringing target intelligence, molecular design, physics, safety triage and laboratory interfaces into one research workflow.','https://github.com/cosmic-hydra/zane','View Repository ↗'),
 ('Space4Climate','A space and climate education initiative using workshops, storytelling and media to make science accessible. I serve as co-founder and CTO.','https://space4climate-blond.vercel.app/','Explore Project ↗')]
for panel,(name,desc,url,cta),file in zip(s.select('.case-content'),projects,files):
    text(panel.select_one('.case-text'),name)
    text(panel.select_one('.case-content_left > .u-copy'),desc)
    panel.select_one('.case-content_guts')['href']=url
    text(panel.select_one('.case-content_link p'),cta)
    pic=panel.select_one('img');pic['src']=f'/assets/portfolio/{file}.svg';pic['alt']=name+' — project illustration';pic.attrs.pop('sizes',None)

process=[
 ('Investigate','Start with a clear question. Understand the problem, examine the data and define what a useful result would look like. Good research begins with honest assumptions.',['Problem definition','Data exploration','Literature','Success criteria']),
 ('Build','Make the idea tangible. Develop a small working system, connect the pieces and iterate through experiments. Progress should be visible in code and in the product.',['Prototype','Architecture','Implementation','Iteration']),
 ('Evaluate','Put the work under scrutiny. Measure behavior, inspect failures and document what holds up. Then ship, learn from real use and make the next version better.',['Evaluation','Failure analysis','Documentation','Release'])]
for card,(name,desc,items) in zip(s.select('.mwg043-card'),process):
    text(card.select_one('h3'),name);text(card.select_one('p.u-weight-500'),desc)
    lines(card.select_one('.mwg043-card-content > p'),items)

for x in s.select('.willem__cover-image,.mwg044-photo'):
    x['src']='/assets/advaith-portrait.png';x['alt']='Advaith Vaithianathan';x.attrs.pop('sizes',None)
for x,file in zip(s.select('.willem__cover-image-extra'),['artificial-hedge','speedx','zane']):
    x['src']=f'/assets/portfolio/{file}.svg';x['alt']='';x.attrs.pop('sizes',None)
for video in s.select('video'):
    pic=s.new_tag('img',attrs={'src':'/assets/portfolio/overview.svg','class':'portfolio-overview','alt':'Advaith Vaithianathan — building across AI, capital and science'})
    video.replace_with(pic)
for x in s.select('a[href]'):
    h=x['href']
    if 'calendly.com' in h:x['href']='mailto:'+email
    if 'webflow.com/@' in h:
        x['href']=github;x['aria-label']='GitHub'
        x.clear();x.string='GH'
    if 'instagram.com/nbnzia' in h:
        x['href']='https://orcid.org/0009-0000-2076-3011';x['aria-label']='ORCID'
        x.clear();x.string='iD'
    if 'linkedin.com/in/yevhenii' in h:
        x['href']=linkedin;x['aria-label']='LinkedIn'
        x.clear();x.string='in'
    if h.startswith('mailto:'):
        x['href']='mailto:'+email
        if x.get_text(strip=True):text(x,email)
    if x.get('target')=='_blank':x['rel']='noopener noreferrer'
for x in s.find_all(['p','div']):
    if len(x.contents)!=1 or not isinstance(x.contents[0],str):continue
    val=x.get_text(strip=True)
    replacement={'READY FOR':"LET'S BUILD",'YOUR':'YOUR','PRESTIGE':'NEXT','MOMENT?':'BIG THING.','© yevhenii nebenzia, 2026':'© Advaith Vaithianathan, 2026','All Rights Reserved':'advvvvaith'}.get(val)
    if replacement is not None:text(x,replacement)

for i,form in enumerate(s.select('.mwg044-form_block')):
    form['id']=f'contact-form-{i}';form['data-name']='Contact Advaith';form['name']=f'contact-form-{i}'
    for field in form.select('input'):
        field['id']=f'{field["name"].lower()}-{i}'
        label=field.find_previous_sibling('p');label['id']=field['id']+'-label';field['aria-labelledby']=label['id']
        field['autocomplete']='name' if field['type']=='text' else 'email'
    wrapper=s.new_tag('div',attrs={'class':'mwg044-form_input-wrapper portfolio-message'})
    label=s.new_tag('p',attrs={'class':'u-copy','id':f'message-label-{i}'});label.string='Message';wrapper.append(label)
    message=s.new_tag('textarea',attrs={'class':'mwg044-form_input w-input','name':'Message','id':f'message-{i}','rows':'2','required':'','aria-labelledby':f'message-label-{i}'})
    wrapper.append(message);form.select_one('button').insert_before(wrapper)
    for x in form.select('button p'):text(x,'Draft Email')
for x in s.select('.success-text'):
    x.clear();a=s.new_tag('a',attrs={'class':'portfolio-email-draft','href':'mailto:'+email});a.string='Open your email draft ↗';x.append(a)
for x in s.select('.success-subscipt'):text(x,'Send it from your email app, or write to '+email+'.')

# Keep the original intro sequence and stabilize its final full-screen geometry.
for script in s.find_all('script'):
    value=script.string or ''
    if 'shuffleLetters' in value:
        script.string="""document.addEventListener('DOMContentLoaded', function () {
          gsap.from('.mwg046-sentence', { opacity: 0, y: 30, duration: .9, delay: 4.5, ease: 'power3.out', clearProps: 'transform,opacity' });
        });"""
    if 'function initWillemLoadingAnimation' in value:
        script.string=value.replace('onComplete: unlockScroll','''onComplete: () => {
          unlockScroll();
          const image = growingImage[0];
          if (image) {
            container.prepend(image);
            gsap.set(image, {x: 0, y: 0, top: 0, left: 0, width: '100%', height: '100%'});
          }
          container.querySelector('.willem-loader').style.display = 'none';
        }''')
    if 'document.querySelectorAll(".mwg044-form_block")' in value:
        script.string=f'''document.addEventListener('submit', function (event) {{
            const form = event.target;
            if (!form.matches('.mwg044-form_block')) return;
            event.preventDefault(); event.stopImmediatePropagation();
            if (!form.reportValidity()) return;
            const data = new FormData(form);
            const body = 'Hi Advaith,\\n\\n' + data.get('Message') + '\\n\\n' + data.get('name') + '\\n' + data.get('Email');
            const wrapper = form.closest('.mwg044-form');
            wrapper.querySelector('.portfolio-email-draft').href = 'mailto:{email}?subject=' + encodeURIComponent('Let\u2019s build something — ' + data.get('name')) + '&body=' + encodeURIComponent(body);
            form.style.display = 'none'; wrapper.querySelector('.mwg044-form-success').style.display = 'block';
        }}, true);
        const portfolioNav = document.querySelector('.bold-nav-full');
        const portfolioMenuButton = portfolioNav.querySelector('button');
        function syncPortfolioMenu() {{
          const open = portfolioNav.getAttribute('data-navigation-status') === 'active';
          portfolioMenuButton.setAttribute('aria-expanded', String(open));
          portfolioMenuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }}
        new MutationObserver(syncPortfolioMenu).observe(portfolioNav, {{attributes: true, attributeFilter: ['data-navigation-status']}});
        syncPortfolioMenu();'''

style=s.new_tag('link',attrs={'rel':'stylesheet','href':'/assets/portfolio/personalization.css'})
s.head.append(style)
(assets / 'personalization.css').write_text('''
.advaith-wordmark {display:block; font-size:3.4rem; font-weight:500; line-height:.9; letter-spacing:-.085em; white-space:nowrap;}
.nav-logo-wrapper {min-width:19rem;}
.nav-logo-wrapper .advaith-wordmark {color:#fff;}
.bold-nav-full__logo .advaith-wordmark {font-size:2rem; letter-spacing:-.065em;}
.willem__h1 {font-size:7.5em;}
.willem__growing-image-wrap .willem__cover-image {object-fit:contain; object-position:center; background:#fff;}
.willem-header {background:#fff;}
.willem__growing-image {pointer-events:none;}
.willem__growing-image::after {content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 60%,rgba(255,255,255,.9) 83%,#fff 100%);}
.portfolio-overview {object-fit:cover; width:100%; height:100%; display:block;}
.case-content_image {object-fit:contain;}
.mwg044-footer_media-link {font-weight:600; font-size:1rem; text-decoration:none;}
.portfolio-message {grid-column:1 / -1;}
.portfolio-message textarea {resize:vertical; min-height:5rem; padding-top:.6rem;}
.portfolio-email-draft {color:inherit; text-decoration:underline; text-underline-offset:.2em;}
.success-subscipt, .mwg044-footer .u-copy {color:#a7a7a2;}
.mwg044-footer_top-email {font-size:clamp(1.1rem, 2.3vw, 2.5rem);}
@media(max-width:991px){.willem__h1{font-size:5em;}.willem__growing-image-wrap .willem__cover-image{object-fit:cover;object-position:50% 35%;}.bold-nav-full[data-navigation-status="not-active"] .bold-nav-full__bar{background:rgba(255,255,255,.94);}}
@media(max-width:479px){.willem__h1{font-size:4.7em;}.mwg046-sentence{font-size:2.5rem;}.mwg044-form_button-content .u-copy{font-size:.9rem;}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto;}.mwg046-sentence{opacity:1!important;transform:none!important;}}
''')
markup=str(s)
# BeautifulSoup's HTML parser folds SVG attribute case; restore required SVG attributes.
markup=markup.replace('viewbox=', 'viewBox=').replace('<clippath ', '<clipPath ').replace('</clippath>', '</clipPath>')
(root / 'src/portfolio.html').write_text(markup)
print('Personalized all sections, brand, portraits, project media and contact links.')
import runpy
runpy.run_path(str(root / 'scripts/enrich-portfolio.py'))['enrich'](root)
