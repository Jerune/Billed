import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const fileField = this.document.querySelector(`input[data-testid="file"]`)
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const fileName = file.name
    const fileNameArray = fileName.split(".")
    const fileExtension = fileNameArray[fileNameArray.length-1].toLowerCase()
    const acceptedExtensions = ['jpg', 'jpeg', 'png']
    const errorMessageFile = this.document.querySelector(`span[data-testid="error-file"]`)
    if (acceptedExtensions.some((extension) => fileExtension.includes(extension))){
      if(fileField.classList.contains('red-border') && errorMessageFile.classList.contains('show')){
        fileField.classList.replace('red-border', 'blue-border')
        errorMessageFile.classList.replace('show', 'hide')
      }
      const formData = new FormData()
      // @ts-ignore
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))
    } else {
      fileField.value = ''
      if(!fileField.classList.contains('red-border') && !errorMessageFile.classList.contains('show')){
        fileField.classList.replace('blue-border', 'red-border')
        errorMessageFile.classList.replace('hide', 'show')
      }
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    const errorMessageSubmit = this.document.querySelector(`span[data-testid="error-submit"]`)
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', this.document.querySelector(`input[data-testid="datepicker"]`).value)
    // @ts-ignore
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: this.document.querySelector(`select[data-testid="expense-type"]`).value,
      name:  this.document.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(this.document.querySelector(`input[data-testid="amount"]`).value),
      date:  this.document.querySelector(`input[data-testid="datepicker"]`).value,
      vat: this.document.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(this.document.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: this.document.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    const billValues = Object.values(bill)
    console.log(billValues)
    console.log(billValues.every((value) => value !== null))
    if (billValues.every((value) => value !== null)){
      if(errorMessageSubmit.classList.contains('show')){
        errorMessageSubmit.classList.replace('show', 'hide')
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    } else {
      if(!errorMessageSubmit.classList.contains('show')){
        errorMessageSubmit.classList.replace('hide', 'show')
      }
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}