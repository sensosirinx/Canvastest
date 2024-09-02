import React, {useEffect, useRef, useState} from 'react'
import {HeroOpts} from "../types/types"


class Hero {
  private canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D | null
  public options: HeroOpts
  public spells: any[]
  constructor(canvas: HTMLCanvasElement, options?: HeroOpts) {
    this.canvas = canvas
    this.ctx = (canvas) ? this.canvas.getContext("2d") : null
    this.options = options || {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      color: '#ffffff',
      colorSpell: '#ffffff',
      direction: 1,
      frequency: 1000,
      player: 0
    }
    this.spells = []
  }

  draw () {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.arc(this.options.x, this.options.y, 20, 0, 2 * Math.PI)
      this.ctx.fillStyle = this.options.color
      this.ctx.fill()
      this.ctx.closePath()
    }
  }

  move () {
    if (this.ctx) {
      this.options.y += this.options.dy * this.options.direction;
      if (this.options.y >= this.canvas.height - 20 || this.options.y <= 20) {
        this.options.direction *= -1;
      }
      this.draw()
    }
  }

  shoot () {
    if (this.ctx) {
      const spell = {
        x: this.options.x,
        y: this.options.y,
        dx: this.options.player === 0 ? 5 : -5,
        dy: 0,
        color: this.options.colorSpell
      };
      this.spells.push(spell)
    }
  }

  updateSpells () {
    if (this.ctx) {
      this.spells = this.spells.map(spell => ({
        ...spell,
        x: spell.x + spell.dx,
        y: spell.y + spell.dy
      })).filter(spell => spell.x > 0 && spell.x < this.canvas.width)
      this.spells.forEach((spell) => {
        this.drawSpell(spell)
      })
    }
  }

  drawSpell (spell: any) {
    if (this.ctx) {
      this.ctx.beginPath()
      this.ctx.arc(spell.x, spell.y, 5, 0, 2 * Math.PI)
      this.ctx.fillStyle = spell.color
      this.ctx.fill()
      this.ctx.closePath()
    }
  }

}

const MainForm: React.FC = (props) => {

  const canvasRef = useRef(null)
  const canvas: HTMLCanvasElement | any = canvasRef.current
  const heroTmp = new Hero(canvas)
  const [mousePos, setMousePos] = useState([0, 0])
  const interval = setInterval(() => {return null}, 10000 )
  const [intervals, setIntervals] = useState([interval, interval])
  const [heroes, setHeroes] = useState({hero1: heroTmp, hero2: heroTmp})
  const [scores, setScores] = useState([0, 0])
  const [cpVisible, setCpVisible] = useState(false)
  const [cpColor, setCpColor] = useState({id: 0, val: '#ffffff'})

  const updateGame = (heroes: {hero1: Hero, hero2: Hero}) => {
    const canvas: HTMLCanvasElement | any = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    let { hero1, hero2 } = heroes
    const mouseX = mousePos[0]
    const mouseY = mousePos[1]
    hero1 = validMouseMove(hero1, mouseX, mouseY)
    hero2 = validMouseMove(hero2, mouseX, mouseY)
    hero1.move()
    hero2.move()
    hero1.updateSpells()
    hero2.updateSpells()
    validateShooting(heroes)
  }

  function validateShooting (heroes: {hero1: Hero, hero2: Hero}) {
    const { hero1, hero2 } = heroes

    hero1.spells.forEach((spell, spellIndex) => {
      if (Math.hypot(spell.x - hero2.options.x, spell.y - hero2.options.y) < 20) {
        setScores([scores[0] + 1, scores[1]])
        hero1.spells.splice(spellIndex, 1)
      }
    })

    hero2.spells.forEach((spell, spellIndex) => {
      if (Math.hypot(spell.x - hero1.options.x, spell.y - hero1.options.y) < 20) {
        setScores([scores[0], scores[1] + 1])
        hero2.spells.splice(spellIndex, 1)
      }
    })

  }

  const clearFrequencyIntervals = () => {
    clearInterval(intervals[0])
    clearInterval(intervals[1])
  }

  const updateFrequencyIntervals = () => {
    let { hero1, hero2 } = heroes
    let heroSpellInterval1 = setInterval(() => hero1.shoot(), hero1.options.frequency)
    let heroSpellInterval2 = setInterval(() => hero2.shoot(), hero2.options.frequency)
    setIntervals([heroSpellInterval1, heroSpellInterval2])
  }

  useEffect(() => {
    const canvas: HTMLCanvasElement | any = canvasRef.current

    if (canvas) {
      const hero1 = new Hero(canvas, {
        x: 50,
        y: 50,
        dx: 0,
        dy: 1.5,
        color: '#ffcc00',
        colorSpell: '#ffcc00',
        direction: 1,
        frequency: 1000,
        player: 0
      })
      hero1.draw()

      const hero2 = new Hero(canvas, {
        x: 450,
        y: 50,
        dx: 0,
        dy: 1,
        color: '#46A109',
        colorSpell: '#46A109',
        direction: 1,
        frequency: 1000,
        player: 1
      })
      hero2.draw()

      setHeroes({hero1: hero1, hero2: hero2})
      let heroSpellInterval1 = setInterval(() => hero1.shoot(), hero1.options.frequency)
      let heroSpellInterval2 = setInterval(() => hero2.shoot(), hero2.options.frequency)
      setIntervals([heroSpellInterval1, heroSpellInterval2])
    }

    return () => {
      clearFrequencyIntervals()
    };
  }, [])

  useEffect(() => {
    const { hero1, hero2 } = heroes
    updateGame(heroes)
    const timeout = setTimeout(() => setHeroes({hero1: hero1, hero2: hero2}), 1000 / 60);
    return () => clearTimeout(timeout);
  },[heroes])

  const validMouseMove = (hero: Hero, mouseX: number, mouseY: number) => {
    if (Math.hypot(hero.options.x - mouseX, hero.options.y - mouseY) < 30) {
      hero.options.direction *= -1
    }
    return hero
  }

  const mouseMoveHandler = (event: any)  => {
    const canvas: HTMLCanvasElement | any = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    setMousePos([mouseX, mouseY])
  }

  const MouseClickHandler = (event: any)  => {
    const canvas: HTMLCanvasElement | any = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const { hero1, hero2 } = heroes
    const hero1Click=  (Math.hypot(hero1.options.x - mouseX, hero1.options.y - mouseY) < 30)
    const hero2Click=  (Math.hypot(hero2.options.x - mouseX, hero2.options.y - mouseY) < 30)

    if (hero1Click) {
      setCpVisible(true)
      setCpColor({id: 0, val: hero1.options.colorSpell})
    }
    else if (hero2Click) {
      setCpVisible(true)
      setCpColor({id: 1, val: hero2.options.colorSpell})
    }
    else {
      setCpVisible(false)
    }

  }

  const setFrequency = (hero: number, e: any) => {
    const val = e.target.valueAsNumber
    const currentHero = (hero === 0) ? heroes.hero1 : heroes.hero2
    currentHero.options.frequency = val
    clearFrequencyIntervals()
    updateFrequencyIntervals()
  }

  const setSpeed = (hero: number, e: any) => {
    const val = e.target.valueAsNumber
    const currentHero = (hero === 0) ? heroes.hero1 : heroes.hero2
    currentHero.options.dy = val
  }

  const handleColorChange = (color: string) => {
    const hero = cpColor.id
    setCpColor({id: hero, val: color})
    const currentHero = (hero === 0) ? heroes.hero1 : heroes.hero2
    currentHero.options.colorSpell = color
  }

  return (
    <div className={"game"}>
      <div className={"score"}>Score: {scores[0]} - {scores[1]}</div>
      <canvas ref={canvasRef} width="500" height="300" onMouseMove={mouseMoveHandler} onClick={MouseClickHandler}/>
      <div className={"options"}>
        <div className={"hero-opts"}>
          <div>
            <label htmlFor={"hero1-frequency"}>Frequency: </label>
            <input type="range" min="100" max="1000" step={100} value={heroes.hero1.options.frequency} className="slider"
                   id="hero1-frequency" onChange={(e) => {setFrequency(0, e)}}/>
          </div>
          <div>
            <label htmlFor={"hero1-speed"}>Speed: </label>
            <input type="range" min="1" max="2" step={0.1} value={heroes.hero1.options.dy} className="slider"
                   id="hero1-speed" onChange={(e) => {setSpeed(0, e)}}/>
          </div>
        </div>
        <div className={"hero-opts"}>
          <div>
            <label htmlFor={"hero2-frequency"}>Frequency: </label>
            <input type="range" min="100" max="1000" step={100} value={heroes.hero2.options.frequency} className="slider"
                   id="hero2-frequency" onChange={(e) => {setFrequency(1, e)}}/>
          </div>
          <div>
            <label htmlFor={"hero2-speed"}>Speed: </label>
            <input type="range" min="1" max="2" step={0.1} value={heroes.hero2.options.dy} className="slider"
                   id="hero2-speed" onChange={(e) => {setSpeed(1, e)}}/>
          </div>
        </div>
      </div>
      <ColorPicker color={cpColor.val} isVisible={cpVisible} onColorChange={handleColorChange}/>
    </div>
  )
}

export default MainForm


interface cpProps {
  color: string,
  isVisible?: boolean | false,
  onColorChange?(arg0: string): void
}

const ColorPicker: React.FC<cpProps> = (props) => {

  const { color, isVisible, onColorChange } = props

  let display = (isVisible) ? "flex" : "none"

  const handleColorChange = (event: any) => {
    if (onColorChange) {
      onColorChange(event.target.value)
    }
  }

  return (
    <div className={"colorpicker"} style={{"display": display}}>
      <label htmlFor={"cp"}>Spell color: </label>
      <input type="color" id="cp" name="heroColor" value={color} onChange={handleColorChange}/>
    </div>
  )
}

