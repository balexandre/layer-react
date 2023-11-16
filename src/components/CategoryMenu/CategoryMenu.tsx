import React, { useState } from 'react'
import Select from 'react-select'
import { useLayerContext } from '../../hooks/useLayerContext'
import { BankTransaction, Category, CategorizationType } from '../../types'

type Props = {
  name?: string
  bankTransaction: BankTransaction
  defaultValue: Category | undefined
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const CategoryMenu = ({
  bankTransaction,
  name,
  defaultValue,
  onChange,
}: Props) => {
  const { categories } = useLayerContext()
  const [selectedValue, setSelectedValue] = useState(defaultValue)

  const suggestedOptions = !!bankTransaction?.categorization_flow?.suggestions
    ? [
        {
          label: 'Suggested',
          options: bankTransaction.categorization_flow.suggestions,
        },
      ]
    : []

  const categoryOptions = (categories || [])
    .map(category => {
      if (category?.subCategories?.length > 0) {
        return {
          label: category.display_name,
          options: category.subCategories,
        }
      }
      return {
        label: category.display_name,
        options: [category],
      }
    })
    .filter(x => x)

  const options = [...suggestedOptions, ...categoryOptions]

  // The menu does not show in all cases unless the
  // menuPortalTarget and styles lines exist
  // See: https://stackoverflow.com/questions/55830799/how-to-change-zindex-in-react-select-drowpdown
  return (
    <Select<Category>
      name={name}
      className="Layer__category-menu"
      options={options}
      isSearchable={true}
      value={selectedValue}
      onChange={value => value && setSelectedValue(value)}
      getOptionLabel={category => category.display_name}
      getOptionValue={category => category.stable_name}
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
    />
  )
}
