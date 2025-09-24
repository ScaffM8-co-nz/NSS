import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

import { FormActions } from "../Form/Actions";

export function SideModal({ heading, open, setOpen, children, handleSubmit, isLoading, formType }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  useEffect(() => {
    if (!open) {
      setShowConfirmation(false);
    }
  }, [open]);

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setOpen(false);
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const handleCloseModal = () => {
    if (showConfirmation) {
      handleConfirmClose();
    } else {
      setShowConfirmation(true);
    }
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 overflow-hidden"
        open={open}
        onClose={handleCloseModal}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-2xl z-50">
                <form
                  className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll z-50"
                  onSubmit={handleSubmit}
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="px-4 py-6 bg-gray-50 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            {heading}
                          </Dialog.Title>
                        </div>
                        <div className="h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Divider container */}
                    <div className="py-6 space-y-6 sm:py-0 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                      {children}
                    </div>
                  </div>
                  <FormActions setOpen={setOpen} isLoading={isLoading} formType={formType} />
                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
        {showConfirmation && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-5 rounded-md shadow-md">
              <p>Are you sure you want to close?</p>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                  onClick={() => setOpen(false)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded"
                  onClick={() => setShowConfirmation(false)}

                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Transition.Root>
  );
}
