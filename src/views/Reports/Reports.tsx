import React, { RefObject, useContext, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { BalanceSheet } from '../../components/BalanceSheet'
import { BalanceSheetStringOverrides } from '../../components/BalanceSheet/BalanceSheet'
import { Button, ButtonVariant, RetryButton } from '../../components/Button'
import { Container } from '../../components/Container'
import { Panel } from '../../components/Panel'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossTableStringOverrides } from '../../components/ProfitAndLossTable'
import { StatementOfCashFlow } from '../../components/StatementOfCashFlow'
import { StatementOfCashFlowStringOverrides } from '../../components/StatementOfCashFlow/StatementOfCashFlow'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useLayerContext } from '../../contexts/LayerContext'
import DownloadCloud from '../../icons/DownloadCloud'

interface ReportsStringOverrides {
  title?: string
  downloadButton?: DownloadButtonStringOverrides
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    table?: ProfitAndLossTableStringOverrides
  }
  balanceSheet?: BalanceSheetStringOverrides
  statementOfCashflow?: StatementOfCashFlowStringOverrides
}

export interface ReportsProps {
  title?: string // deprecated
  stringOverrides?: ReportsStringOverrides
  enabledReports?: ReportType[]
}

type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow'
type ReportOption = { value: ReportType; label: string }
export interface ReportsPanelProps {
  containerRef: RefObject<HTMLDivElement>
  openReport: ReportType
  stringOverrides?: ReportsStringOverrides
}

interface DownloadButtonStringOverrides {
  downloadButtonText?: string
  retryButtonText?: string
}

const DownloadButton = ({
  stringOverrides,
}: {
  stringOverrides?: DownloadButtonStringOverrides
}) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)

  const handleClick = async () => {
    const month = (dateRange.startDate.getMonth() + 1).toString()
    const year = dateRange.startDate.getFullYear().toString()
    const getProfitAndLossCsv = Layer.getProfitAndLossCsv(
      apiUrl,
      auth.access_token,
      {
        params: {
          businessId: businessId,
          year: year,
          month: month,
        },
      },
    )
    try {
      const result = await getProfitAndLossCsv()
      if (result?.data?.presignedUrl) {
        window.location.href = result.data.presignedUrl
        setRequestFailed(false)
      } else {
        setRequestFailed(true)
      }
    } catch (e) {
      setRequestFailed(true)
    }
  }

  return requestFailed ? (
    <RetryButton
      onClick={handleClick}
      className='Layer__download-retry-btn'
      error={'Approval failed. Check connection and retry in few seconds.'}
    >
      {stringOverrides?.retryButtonText || 'Retry'}
    </RetryButton>
  ) : (
    <Button
      variant={ButtonVariant.secondary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={handleClick}
    >
      {stringOverrides?.downloadButtonText || 'Download'}
    </Button>
  )
}

const getOptions = (enabledReports: ReportType[]) => {
  return [
    enabledReports.includes('profitAndLoss')
      ? {
          value: 'profitAndLoss',
          label: 'Profit & Loss',
        }
      : null,
    enabledReports.includes('balanceSheet')
      ? {
          value: 'balanceSheet',
          label: 'Balance Sheet',
        }
      : null,
    enabledReports.includes('statementOfCashFlow')
      ? {
          value: 'statementOfCashFlow',
          label: 'Statement of Cash Flow',
        }
      : null,
  ].filter(o => !!o) as ReportOption[]
}

export const Reports = ({
  title,
  stringOverrides,
  enabledReports = ['profitAndLoss', 'balanceSheet', 'statementOfCashFlow'],
}: ReportsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<ReportType>(enabledReports[0])

  const options = getOptions(enabledReports)
  const defaultTitle =
    enabledReports.length > 1
      ? 'Reports'
      : options.find(option => (option.value = enabledReports[0]))?.label

  return (
    <View title={stringOverrides?.title || title || defaultTitle}>
      {enabledReports.length > 1 && (
        <div className='Layer__component Layer__header__actions'>
          <Toggle
            name='reports-tabs'
            options={options}
            selected={activeTab}
            onChange={opt => setActiveTab(opt.target.value as ReportType)}
          />
        </div>
      )}
      <Container name='reports' ref={containerRef}>
        <ProfitAndLoss asContainer={false}>
          <ReportsPanel
            containerRef={containerRef}
            openReport={activeTab}
            stringOverrides={stringOverrides}
          />
        </ProfitAndLoss>
      </Container>
    </View>
  )
}

const ReportsPanel = ({
  containerRef,
  openReport,
  stringOverrides,
}: ReportsPanelProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)
  return (
    <>
      {openReport === 'profitAndLoss' && (
        <View
          type='panel'
          headerControls={
            <>
              <ProfitAndLoss.DatePicker />
              <DownloadButton
                stringOverrides={stringOverrides?.downloadButton}
              />
            </>
          }
        >
          <Panel
            sidebar={
              <ProfitAndLoss.DetailedCharts
                showDatePicker={false}
                stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
              />
            }
            sidebarIsOpen={Boolean(sidebarScope)}
            parentRef={containerRef}
          >
            <ProfitAndLoss.Table
              asContainer={false}
              stringOverrides={stringOverrides?.profitAndLoss?.table}
            />
          </Panel>
        </View>
      )}
      {openReport === 'balanceSheet' && (
        <BalanceSheet stringOverrides={stringOverrides?.balanceSheet} />
      )}
      {openReport === 'statementOfCashFlow' && (
        <StatementOfCashFlow
          stringOverrides={stringOverrides?.statementOfCashflow}
        />
      )}
    </>
  )
}
