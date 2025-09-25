import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomSlotLab } from '@/components/CustomSlotLab';

describe('CustomSlotLab', () => {
  it('submits sandbox slot definitions', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<CustomSlotLab onCreate={onCreate} />);

    await user.clear(screen.getByLabelText(/Slot name/i));
    await user.type(screen.getByLabelText(/Slot name/i), 'Sidebar Booster');
    await user.selectOptions(screen.getByLabelText(/Placement/i), 'sidebar');

    await user.clear(screen.getByLabelText(/Width/i));
    await user.type(screen.getByLabelText(/Width/i), '320');
    await user.clear(screen.getByLabelText(/Height/i));
    await user.type(screen.getByLabelText(/Height/i), '50');

    await user.selectOptions(screen.getByLabelText(/Prebid timeout/i), '1200');
    await user.click(screen.getByRole('checkbox', { name: /Enable lazy loading/i }));

    await user.click(screen.getByRole('button', { name: /Launch sandbox slot/i }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        name: 'Sidebar Booster',
        placement: 'sidebar',
        sizes: [{ width: 320, height: 50 }],
        prebidTimeoutMs: 1200,
        lazyLoad: false
      })
    );
    expect(onCreate.mock.calls[0][0].id).toEqual(expect.any(String));
  });

  it('disables launch when configuration is invalid', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<CustomSlotLab onCreate={onCreate} />);

    const button = screen.getByRole('button', { name: /Launch sandbox slot/i });
    expect(button).toBeEnabled();

    await user.clear(screen.getByLabelText(/Width/i));
    await user.type(screen.getByLabelText(/Width/i), '0');

    expect(button).toBeDisabled();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
