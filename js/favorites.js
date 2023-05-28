import { GithubUser } from './GithubUser.js'

// classe que conterá a lógica dos dados
export class Favorites{
  constructor(root){
    this.root = document.querySelector(root)
    this.load()
  }

  load(){
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    const noFavorites = this.root.querySelector('.no-favorites')

    if(this.entries == 0){
      noFavorites.classList.remove('hide')
    }else{
      noFavorites.classList.add('hide')
    }
  }

  save(){
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username){
    try{
      const userExists = this.entries.find(entry => entry.login === username)
      
      if(userExists){
        throw new Error('Usuário já em seus favoritos!')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined){
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      this.load()

    } catch(error){
      alert(error.message)
    }
  }

  delete(user){
    const filteredEntries = this.entries
    .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries

    this.update()
    this.save()
    this.load()
  }
}

// classe que criará a visualização e eventos do HTML
export class FavoritesView extends Favorites{
  constructor(root){
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd(){
    const favButton = this.root.querySelector('.search button')
    favButton.onclick = () => {
       const {value} = this.root.querySelector('.search input')
       
       this.add(value)
       this.update()
    }
  }

  update(){
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow()

      //user
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = `${user.name}`
      row.querySelector('.user span').textContent = `/${user.login}`
      //repos
      row.querySelector('.repositories').textContent = `${user.public_repos}`
      //followers
      row.querySelector('.followers').textContent = `${user.followers}`
      //button remove
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover este favorito?')
        if(isOk){
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow(){
    const tr = document.createElement('tr')

    tr.innerHTML = `
        <td class="user">
          <img src="http://github.com/lucaslirah.png" alt="Imagem de Lucas Lira">
          <a href="http://github.com/lucaslirah" target="_blank">
            <p>Lucas Lira</p>
            <span>/lucaslirah</span>
          </a>
        </td>
        <td class="repositories">
          27
        </td>
        <td class="followers">
          5
        </td>
        <td>
          <button class="remove">remover</button>
        </td>
  `
  return tr
  }

  removeAllTr(){    
    this.tbody.querySelectorAll('tr')
    .forEach(tr => {
      tr.remove()
    })
  }
}