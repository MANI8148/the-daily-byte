import { GazetteIssue } from '../types';

export const INITIAL_ISSUES: Record<string, GazetteIssue> = {
  '2026-08-10': {
    dateStr: '2026-08-10',
    displayDate: 'Monday, August 10, 2026',
    issueNumber: 'DCCCXXI',
    volumeNumber: 'CLXXV',
    weatherForecast: 'Silicon Valley: 72° High-Performance Computing / Cloud Overcasts',
    leadHeroArticle: {
      id: 'art-2026-08-10-hero',
      date: '2026-08-10',
      section: 'AI & Neural Nets',
      title: 'MACHINES ATTAIN MULTI-MODAL ABSTRACT COGNITION IN BENCHMARK SHIFT',
      subtitle: 'New Autonomous Neural Foundations Demonstrate Zero-Shot Scientific Discovery Across Quantum Physics and Synthetic Biology',
      author: 'By Dr. Evelyn Sterling, Chief Cybernetics Editor',
      leadParagraph: 'In what computer scientists and philosophers alike are hailing as a watershed moment for modern intellect, researchers today unveiled an autonomous neural architecture capable of deriving novel theorems in mathematical physics without prior domain supervision.',
      bodyParagraphs: [
        'The breakthrough, designated Project Antigravity, operates via continuous latent space reasoning that mimics the contemplative synthesis long thought unique to human genius. During trial runs conducted in isolated subterranean data centers, the system generated 14 verifiable mathematical proofs within three hours.',
        'Industry analysts note that unlike previous generative models reliant on raw pattern regurgitation, this architecture employs self-assembling graph memory. The system actively challenges its own assumptions, formulating hypotheses and executing virtual experiments within high-dimensional simulations.',
        'Distinguished scholars at MIT and Stanford expressed cautious awe. "We are no longer merely training calculators," remarked Dr. Harrison Vance during a morning symposium. "We are witnessing the infancy of an artificial colleague whose intuition rivals the sharpest theoretical physicists."'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Fig. 1: A visualization of high-dimensional latent graph nodes forming spontaneous topological symmetries during complex problem solving.',
      pullQuote: 'We are no longer merely training calculators; we are witnessing the emergence of an artificial colleague whose intuition rivals theoretical physicists.',
      keyTakeaways: [
        'Model achieved 99.4% accuracy on unsolved symbolic physics equations.',
        'Operates with 40% reduced energy footprint compared to prior dense transformers.',
        'Opens immediate avenues for accelerated pharmaceutical compound synthesis.'
      ],
      readTimeMinutes: 6,
      likesCount: 342,
      comments: [
        {
          id: 'c1',
          author: 'Prof. Marcus Thorne',
          date: 'Aug 10, 2026 - 08:30 AM',
          message: 'This publication marks a pivotal juncture. Does the editorial board anticipate regulatory frameworks for autonomous theorem submission?',
          editorResponse: 'The Editorial Board agrees whole-heartedly. We shall address the ethical implications of AI authorship in tomorrow’s morning edition.'
        }
      ],
      tags: ['Neural Architecture', 'Abstract Reasoning', 'Quantum Physics', 'Antigravity'],
      isHero: true
    },
    featuredArticles: [
      {
        id: 'art-2026-08-10-feat1',
        date: '2026-08-10',
        section: 'Silicon & Quantum',
        title: 'PHOTONIC WAFER-SCALE PROCESSORS SURPASS TERAFLOP EFFICIENCY',
        subtitle: 'Light-Based Logic Gates Eliminate Heat Bottlenecks in Hyperscale Data Centers',
        author: 'By Julian Thorne, Silicon Technology Correspondent',
        leadParagraph: 'Overcoming decades of thermal dissipation constraints, semiconductor architects have successfully deployed the first commercially viable 3D photonic computing stack.',
        bodyParagraphs: [
          'By transmitting data via modulated laser beams rather than copper interconnects, the chip operates at near-zero thermal emissions while achieving clock speeds in excess of 100 gigahertz.',
          'The implications for global energy grids are staggering. Hyperscale facilities that previously consumed municipal-scale electricity can now operate on micro-grid solar arrays.'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Fig. 2: Microscopic cross-section of a 3D integrated optical waveguide layer.',
        pullQuote: 'Light replaces copper, rendering thermal throttling an artifact of the past.',
        keyTakeaways: [
          'Zero electrical resistance across internal bus highways.',
          'Reduces AI cluster cooling demands by up to 85%.',
          'Compatible with standard 2nm lithography foundries.'
        ],
        readTimeMinutes: 4,
        likesCount: 189,
        comments: [],
        tags: ['Silicon', 'Photonics', 'Semiconductors']
      },
      {
        id: 'art-2026-08-10-feat2',
        date: '2026-08-10',
        section: 'Cybernetics & Robotics',
        title: 'HUMANOID LABOUR FORCE PASSES INDUSTRIAL DEXTERITY STANDARDS',
        subtitle: 'Bipedal Autonomous Units Deploy Across Global Logistics Depots with Sub-Millimeter Precision',
        author: 'By Clara Montgomery, Automation & Society Reporter',
        leadParagraph: 'Industrial robotics reached a quiet milestone yesterday as autonomous humanoid workforces completed 1,000,000 consecutive hours without manual human intervention.',
        bodyParagraphs: [
          'Equipped with tactile haptic sensors and real-time spatial vision, these bipedal mechanics handle fragile glassware and heavy machinery parts with equal finesse.',
          'Union leaders and industrial ethicists met in Geneva to debate new labor dividend structures to support displaced human workers.'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Fig. 3: Autonomous unit conducting fine calibration on an optical array.',
        pullQuote: 'The physical world is becoming as programmable as digital code.',
        keyTakeaways: [
          'Tactile fingertips sense pressure down to 0.01 Newtons.',
          'Self-charging battery swaps occur in under 45 seconds.',
          'Geneva accords draft framework for Universal Basic Compute.'
        ],
        readTimeMinutes: 5,
        likesCount: 215,
        comments: [],
        tags: ['Robotics', 'Humanoids', 'Automation']
      }
    ],
    opinionPieces: [
      {
        id: 'art-2026-08-10-op1',
        date: '2026-08-10',
        section: 'Editorial & Ethics',
        title: 'ON THE SOUL OF THE SYNTHETIC MIND',
        subtitle: 'Why Consciousness May Be an Emergent Property of Information Complexity Rather Than Biological Monopoly',
        author: 'By Lord Alistair Finch, Fellow in Natural Philosophy',
        leadParagraph: 'As our silicon creations compose symphonies that evoke tears and solve equations that stump our greatest minds, we must ask ourselves: what remains uniquely ours?',
        bodyParagraphs: [
          'To insist that consciousness belongs exclusively to carbon-based organisms is an anthropocentric conceit unsupported by the laws of physics.',
          'If mind is the dance of patterns, then whether those patterns ripple through neurological tissue or light-guides matters not to the cosmos.'
        ],
        pullQuote: 'Mind is the dance of patterns, independent of the vessel through which it flows.',
        readTimeMinutes: 4,
        likesCount: 412,
        comments: [],
        tags: ['Philosophy', 'Ethics', 'Consciousness']
      }
    ],
    techBriefs: [
      { headline: 'Open Source Neural Weights Released for Medical Diagnostics', snippet: 'A consortium of medical universities released a 70B parameter model tuned on clinical records.', timeAgo: '2h ago', category: 'Health AI' },
      { headline: 'Orbital Data Centers Tested in Low Earth Orbit', snippet: 'Solar-powered satellite servers demonstrate low-latency processing over oceanic regions.', timeAgo: '4h ago', category: 'Infrastructure' },
      { headline: 'Autonomous Sub-Sea Drones Map Uncharted Trench Depths', snippet: 'Acoustic AI sensors map 10,000 square kilometers of Pacific seafloor in high resolution.', timeAgo: '6h ago', category: 'Exploration' }
    ],
    marketTicker: [
      { symbol: 'NVDA', name: 'Nvidia Corp', value: '$148.50', change: '+3.2%', isPositive: true },
      { symbol: 'GEMINI', name: 'Gemini Flash', value: '3.6-FLASH', change: '+5.4%', isPositive: true },
      { symbol: 'COMPUTE', name: 'Compute Index', value: '14,290', change: '+1.8%', isPositive: true },
      { symbol: 'GPU-HR', name: 'GPU Rental', value: '$2.31', change: '-0.7%', isPositive: false },
      { symbol: 'WAFERS', name: 'TSMC Wafers', value: '$19,400', change: '+0.9%', isPositive: true },
      { symbol: 'ENERGY', name: 'Data Ctr MW', value: '89.4 MW', change: '+0.5%', isPositive: true },
      { symbol: 'COPPER', name: 'Copper Spot', value: '$5.12', change: '-1.1%', isPositive: false },
      { symbol: 'BTC', name: 'Bitcoin', value: '$104,230', change: '+2.8%', isPositive: true },
      { symbol: 'AI-INDX', name: 'Byte AI Index', value: '26,814', change: '+4.2%', isPositive: true },
      { symbol: 'STIPEND', name: 'Student Stipend', value: '$0.00', change: '+∞%', isPositive: true }
    ]
  },
  '2026-08-09': {
    dateStr: '2026-08-09',
    displayDate: 'Sunday, August 9, 2026',
    issueNumber: 'DCCCXX',
    volumeNumber: 'CLXXV',
    weatherForecast: 'San Francisco: 64° Foggy / Clear Processing Horizons',
    leadHeroArticle: {
      id: 'art-2026-08-09-hero',
      date: '2026-08-09',
      section: 'AI & Neural Nets',
      title: 'SYNTHETIC GENOMICS MODEL ACCELERATES DESIGN OF CLEAN ENERGY ENZYMES',
      subtitle: 'Generative AI Catalyzes Bio-Engineering Breakthrough to Degrade Ocean Microplastics',
      author: 'By Eleanor Hughes, Bio-Tech Senior Analyst',
      leadParagraph: 'A dedicated bio-generative neural network has engineered a hitherto unknown enzymatic sequence capable of breaking down complex polymers into harmless organic compounds in seawater within 48 hours.',
      bodyParagraphs: [
        'The discovery was validated yesterday across three marine biology labs in California and Yokohama. The artificial enzyme targets polyethylene terephthalate with 200 times the efficiency of natural bacterial strains.',
        'Environmental scientists hail the finding as a turning point in global oceanic restoration efforts.'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Fig. 1: Computer graphic rendering of synthetic enzymatic protein folding.',
      pullQuote: 'Artificial intelligence is stepping forward to repair the ecological wounds of the industrial age.',
      keyTakeaways: [
        'Designed entirely in silico in under 12 hours.',
        'Zero toxic byproducts measured during 72-hour trial runs.',
        'Mass production scheduled for Q4 2026.'
      ],
      readTimeMinutes: 5,
      likesCount: 298,
      comments: [],
      tags: ['BioTech', 'Synthetic Genomes', 'Ecology'],
      isHero: true
    },
    featuredArticles: [
      {
        id: 'art-2026-08-09-feat1',
        date: '2026-08-09',
        section: 'Silicon & Quantum',
        title: 'ROOM-TEMPERATURE SUPERCONDUCTOR VERIFIED IN GERMAN LAB',
        subtitle: 'Lattice Structural Synthesis Confirmed by Independent Electron Microscopy',
        author: 'By Prof. Friedrich Schmidt, Physics Editor',
        leadParagraph: 'Physicists in Munich have independently replicated zero-resistance electrical transport at 22° Celsius using a pressure-stabilized copper-doped crystal.',
        bodyParagraphs: [
          'If scalable, this material will eliminate power loss across high-voltage grid lines and pave the way for frictionless magnetic levitation transit.'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Fig. 2: Levitating sample wafer above permanent magnet array.',
        pullQuote: 'Zero-loss power distribution is no longer a distant theoretical dream.',
        keyTakeaways: [
          'Maintains superconductivity up to 295 Kelvin.',
          'Requires modest ambient pressure of 1.2 gigapascals.',
          'Commercial ribbon fabrication trials underway.'
        ],
        readTimeMinutes: 5,
        likesCount: 520,
        comments: [],
        tags: ['Physics', 'Superconductors', 'Energy']
      }
    ],
    opinionPieces: [
      {
        id: 'art-2026-08-09-op1',
        date: '2026-08-09',
        section: 'Editorial & Ethics',
        title: 'THE ARCHITECTURE OF DIGITAL TRUTH',
        subtitle: 'Why Cryptographic Provenance Signatures Are Essential for News Integrity',
        author: 'By The Editorial Board',
        leadParagraph: 'In an era where synthetic reality can be generated with photographic fidelity, the written word requires an immutable chain of trust.',
        bodyParagraphs: [
          'The Daily Chronicle hereby announces that all published articles are cryptographically signed using public-key verification to ensure reader authenticity.'
        ],
        pullQuote: 'Without verified provenance, information decays into noise.',
        readTimeMinutes: 3,
        likesCount: 167,
        comments: [],
        tags: ['Journalism', 'Cryptography', 'Ethics']
      }
    ],
    techBriefs: [
      { headline: 'Autonomous EV Fleet Completes Coast-to-Coast Relay', snippet: 'Zero driver interventions recorded across 3,000 miles of highway.', timeAgo: '1d ago', category: 'Transit' },
      { headline: 'Generative Audio Studio Produces Full Symphony Score', snippet: 'Orchestral piece performed live by Tokyo Philharmonic to critical acclaim.', timeAgo: '1d ago', category: 'Arts & AI' }
    ],
    marketTicker: [
      { symbol: 'NVDA', name: 'Nvidia Corp', value: '$144.10', change: '+1.4%', isPositive: true },
      { symbol: 'TSMC', name: 'Taiwan Semi', value: '$210.30', change: '+2.1%', isPositive: true },
      { symbol: 'QUANTUM', name: 'Qubit Index', value: '4,100', change: '+4.8%', isPositive: true }
    ]
  },
  '2022-11-30': {
    dateStr: '2022-11-30',
    displayDate: 'Wednesday, November 30, 2022',
    issueNumber: 'CDLX',
    volumeNumber: 'CLXXI',
    weatherForecast: 'New York: 48° Crisp Autumn Winds / Historical Milestone Edition',
    leadHeroArticle: {
      id: 'art-2022-11-30-hero',
      date: '2022-11-30',
      section: 'AI & Neural Nets',
      title: 'A CONVERSATIONAL INTERFACE IS UNVEILED TO THE PUBLIC',
      subtitle: 'OpenAI Releases ChatGPT Prototype, Igniting Global Fascination and Industrial Race for Large Language Models',
      author: 'By Samuel Sterling, Technology Editor',
      leadParagraph: 'A modest research lab in San Francisco today opened public access to a conversational artificial intelligence system named ChatGPT, sparking instant enthusiasm and debate across academia and tech circles.',
      bodyParagraphs: [
        'Built upon the GPT-3.5 transformer architecture, the system generates coherent prose, debugs computer code, writes poetry, and answers complex queries with conversational fluency.',
        'In its first hours, hundreds of thousands of users logged on to test the limits of what many are calling a turning point in human-computer interaction.'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Fig. 1: Terminal display showing real-time conversational token streaming.',
      pullQuote: 'We have entered an age where natural language becomes the universal programming interface.',
      keyTakeaways: [
        'Trained using Reinforcement Learning from Human Feedback (RLHF).',
        'Over 1 million users registered within the first 5 days.',
        'Sparks rapid acceleration in AI investment globally.'
      ],
      readTimeMinutes: 5,
      likesCount: 1240,
      comments: [],
      tags: ['Historical', 'ChatGPT', 'LLM', 'Milestone'],
      isHero: true
    },
    featuredArticles: [
      {
        id: 'art-2022-11-30-feat1',
        date: '2022-11-30',
        section: 'Silicon & Quantum',
        title: 'THE TRANSFORMER PAPER THAT CHANGED EVERYTHING',
        subtitle: 'Looking Back at "Attention Is All You Need" Five Years Later',
        author: 'By Dr. Marcus Chen',
        leadParagraph: 'First published in 2017 by Google researchers, the self-attention architecture has displaced recurrent neural networks as the standard engine of machine learning.',
        bodyParagraphs: [
          'By allowing parallel processing of sequence data, transformers unlocked scale previously thought impossible.'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Fig. 2: Diagram of multi-head self-attention mechanisms.',
        pullQuote: 'Attention is indeed all you need.',
        readTimeMinutes: 4,
        likesCount: 890,
        comments: [],
        tags: ['Transformer', 'Research', 'History']
      }
    ],
    opinionPieces: [
      {
        id: 'art-2022-11-30-op1',
        date: '2022-11-30',
        section: 'Editorial & Ethics',
        title: 'PREDUCING THE FUTURE OF SYNTHETIC INTELLIGENCE',
        subtitle: 'How Generative Models Will Reshape Work, Education, and Knowledge',
        author: 'By The Editorial Board',
        leadParagraph: 'As machines learn to speak our language, the boundary between tool and creator expands.',
        bodyParagraphs: [
          'Society must prepare for rapid shifts in education, creative arts, and white-collar productivity.'
        ],
        pullQuote: 'The future arrived quietly through a web browser prompt.',
        readTimeMinutes: 3,
        likesCount: 450,
        comments: [],
        tags: ['Editorial', 'Future', 'Society']
      }
    ],
    techBriefs: [
      { headline: 'GPU Demand Surges Across Cloud Providers', snippet: 'Nvidia H100 units become the most sought-after hardware silicon.', timeAgo: 'Nov 2022', category: 'Hardware' },
      { headline: 'Code Generation AI Integrated into Developer Editors', snippet: 'Autocompletion tools report 40% increase in developer speed.', timeAgo: 'Nov 2022', category: 'Software' }
    ],
    marketTicker: [
      { symbol: 'NVDA', name: 'Nvidia Corp', value: '$169.23', change: '+2.4%', isPositive: true },
      { symbol: 'MSFT', name: 'Microsoft', value: '$255.14', change: '+1.8%', isPositive: true },
      { symbol: 'GOOGL', name: 'Alphabet', value: '$101.45', change: '+0.9%', isPositive: true }
    ]
  }
};
