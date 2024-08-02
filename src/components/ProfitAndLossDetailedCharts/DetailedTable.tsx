import React from 'react'
import { DEFAULT_CHART_COLOR_TYPE } from '../../config/charts'
import {
  Scope,
  SidebarScope,
  ProfitAndLossFilters,
} from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import SortArrows from '../../icons/SortArrows'
import { centsToDollars as formatMoney } from '../../models/Money'
import { SortDirection } from '../../types'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import classNames from 'classnames'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

export interface DetailedTableProps {
  filteredData: LineBaseItem[]
  hoveredItem?: string
  setHoveredItem: (name?: string) => void
  sidebarScope: SidebarScope
  filters: ProfitAndLossFilters
  sortBy: (scope: Scope, field: string, direction?: SortDirection) => void
  stringOverrides?: DetailedTableStringOverrides
}

export const mapColorsToTypes = (data: any[]) => {
  const typeToColor: any = {}
  const typeToLastOpacity: any = {}
  let colorIndex = 0

  return data.map((obj) => {
    const type = obj.type

    if (!typeToColor[type]) {
      typeToColor[type] =
        DEFAULT_CHART_COLOR_TYPE[colorIndex % DEFAULT_CHART_COLOR_TYPE.length]
      colorIndex++
      typeToLastOpacity[type] = 1
    } else {
      typeToLastOpacity[type] -= 0.1
    }

    const opacity = typeToLastOpacity[type]

    return {
      color: typeToColor[type],
      opacity: opacity,
    }
  })
}

export const DetailedTable = ({
  filteredData,
  sidebarScope,
  filters,
  sortBy,
  hoveredItem,
  setHoveredItem,
  stringOverrides,
}: DetailedTableProps) => {
  const buildColClass = (column: string) => {
    return classNames(
      'Layer__sortable-col',
      sidebarScope && filters[sidebarScope]?.sortBy === column
        ? `sort--${
            (sidebarScope && filters[sidebarScope]?.sortDirection) ?? 'desc'
          }`
        : ''
    )
  }

  const typeColorMapping: any = mapColorsToTypes(filteredData)

  // Index to keep track of the next color to assign
  let colorIndex = 0

  return (
    <div className='details-container'>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th
                className={buildColClass('category')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'category')}
              >
                {stringOverrides?.categoryColumnHeader || "Category"} <SortArrows className='Layer__sort-arrows' />
              </th>
              <th
                className={buildColClass('type')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'type')}
              >
                {stringOverrides?.typeColumnHeader || "Type"} <SortArrows className='Layer__sort-arrows' />
              </th>
              <th></th>
              <th
                className={buildColClass('value')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'value')}
              >
                {stringOverrides?.valueColumnHeader || "Value"} <SortArrows className='Layer__sort-arrows' />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .filter((x) => !x.hidden)
              .map((item, idx) => {
                return (
                  <tr
                    key={`pl-side-table-item-${idx}`}
                    className={classNames(
                      'Layer__profit-and-loss-detailed-table__row',
                      hoveredItem && hoveredItem === item.display_name
                        ? 'active'
                        : ''
                    )}
                    onMouseEnter={() => setHoveredItem(item.display_name)}
                    onMouseLeave={() => setHoveredItem(undefined)}
                  >
                    <td className='category-col'>{item.display_name}</td>
                    <td className='type-col'>{item.type}</td>
                    <td className='value-col'>${formatMoney(item.value)}</td>
                    <td className='share-col'>
                      <span className='share-cell-content'>
                        {formatPercent(item.share)}%
                        <div
                          className='share-icon'
                          style={{
                            background: typeColorMapping[idx].color,
                            opacity: typeColorMapping[idx].opacity,
                          }}
                        />
                      </span>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
