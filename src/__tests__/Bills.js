/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js'
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const billsContainer = new Bills({
        document, onNavigate, store: mockStore, localStorage: null
      })
      const result = await billsContainer.getBills()
      const dates = result.map(bill => bill.date)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    it("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const mockedBill1Nom  = await screen.getByText("encore")
      expect(mockedBill1Nom).toBeTruthy()
      const mockedBill1Date  = await screen.getByText("4 Avr. 04")
      expect(mockedBill1Date).toBeTruthy()
    })
  })

  describe("When I click on new bill button", () => {
    it("Should open a page to create a new bill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const billsContainer = new Bills({
        document, onNavigate, store: mockStore, localStorage: null
      })
      document.body.innerHTML = BillsUI({ data: bills })
      const handleClickButton = jest.fn((e) => billsContainer.handleClickNewBill())
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickButton)
      userEvent.click(newBillButton)
      expect(handleClickButton).toHaveBeenCalled()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })

  describe("When I click on one of the eye icons", () => {
    it("Should open the modal and show an image", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const billsContainer = new Bills({
        document, onNavigate, store: mockStore, localStorage: null
      })
      document.body.innerHTML = BillsUI({ data: bills })
      
      const eyeButtons = screen.getAllByTestId("icon-eye")
      const handleClickButton = jest.fn(() => billsContainer.handleClickIconEye(eyeButtons[1]))
      eyeButtons[1].addEventListener('click', handleClickButton)
      userEvent.click(eyeButtons[1])
      expect(handleClickButton).toHaveBeenCalled()
      expect(screen.getByTestId('modaleFile').getAttribute('class')).toContain('show')
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
