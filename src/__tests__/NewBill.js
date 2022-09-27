/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    it("Should display the form to create a new bill", () => {
      document.body.innerHTML = NewBillUI()
      const newBillForm = screen.getAllByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })
})
