/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { mockedForm } from "../__mocks__/formDetails.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'employee@test.tld'
  }))

  document.body.innerHTML = NewBillUI()
})

describe("Given I am connected as an employee", () => {
  describe("When I land on NewBill Page", () => {
    it("Should display the form to create a new bill", () => {
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })

  describe("When I click the submit button", () => {
    
    it("Should post the form data and navigating to bills page, when submitting with all required data", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })

      screen.getByTestId('expense-type').value = mockedForm.type
      screen.getByTestId('expense-name').value = mockedForm.name
      screen.getByTestId('datepicker').value = mockedForm.date
      screen.getByTestId('amount').value = mockedForm.amount
      screen.getByTestId('expense-name').value = mockedForm.name
      screen.getByTestId('vat').value = mockedForm.vat
      screen.getByTestId('pct').value = mockedForm.pct
      screen.getByTestId('commentary').value = mockedForm.commentary
      newBillContainer.fileName = mockedForm.fileName
      newBillContainer.fileUrl = mockedForm.fileUrl

      const handleSubmitButton = jest.fn((e) => newBillContainer.handleSubmit(e))
      const submitButton = screen.getByText("Envoyer")
      submitButton.addEventListener('click', handleSubmitButton)
      userEvent.click(submitButton)
      expect(handleSubmitButton).toBeCalled()
      const billsPageTitle = screen.getByText('Mes notes de frais')
      expect(billsPageTitle).toBeTruthy()
    })

    it("Should trigger an error when one of the required fields returns null", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      
      const handleSubmitButton = jest.fn((e) => newBillContainer.handleSubmit(e))
      const submitButton = screen.getByText("Envoyer")
      submitButton.addEventListener('click', handleSubmitButton)
      userEvent.click(submitButton)
      expect(handleSubmitButton).toThrowError()
    })
  })
  describe("When I upload a document", () => {
    it("Should show an error when the document does not have a correct extension", () =>{

    })
  })
})
