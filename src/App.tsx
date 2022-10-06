import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { Employee } from "./utils/types"
import { InputSelect } from "./components/InputSelect"
import { TransactionPane } from "./components/TransactionPane"
import { Instructions } from "./components/Instructions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [rowsShown, setRowsShown] = useState(5)
  const [employeeLoading, setEmployeeLoading] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const showViewMore = rowsShown < (transactions ? transactions.length : 0)

  const loadEmployees = useCallback(async () => {
    setEmployeeLoading(true)
    await employeeUtils.fetchAll()
    setEmployeeLoading(false)
  }, [employeeUtils])

  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData()

    await paginatedTransactionsUtils.fetchAll()
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
      loadEmployees()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions, loadEmployees])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeeLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            console.log(newValue)
            if (newValue === null) {
              return
            }
            if (newValue.id) {
              await loadTransactionsByEmployee(newValue.id)
            } else {
              loadAllTransactions()
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {transactions === null ? (
            <div className="RampLoading--container">Loading...</div>
          ) : (
            <Fragment>
              <div data-testid="transaction-container">
                {transactions.slice(0, rowsShown).map((transaction) => (
                  <TransactionPane key={transaction.id} transaction={transaction} />
                ))}
              </div>
              {showViewMore && (
                <button
                  className="RampButton"
                  disabled={paginatedTransactionsUtils.loading}
                  onClick={() => {
                    setRowsShown(rowsShown + 5)
                  }}
                >
                  View More
                </button>
              )}
            </Fragment>
          )}
        </div>
      </main>
    </Fragment>
  )
}
