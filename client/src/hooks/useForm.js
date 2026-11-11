import { useCallback, useState } from 'react';

export default function useForm(initialValues = {}, validateFn = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === 'checkbox' ? checked : value);
  }, [setValue]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    if (typeof validateFn !== 'function') {
      setErrors({});
      return true;
    }
    const nextErrors = validateFn(values) || {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [validateFn, values]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e) e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (!validate()) return false;
    if (typeof onSubmit === 'function') await onSubmit(values);
    return true;
  }, [validate, values]);

  const reset = useCallback((nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
    setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    values,
    errors,
    touched,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    validate,
    handleSubmit,
    reset,
    setErrors,
  };
}