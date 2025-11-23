import { render, screen, fireEvent } from '@testing-library/react';
import ResourcePanel from './ResourcePanel';
import { describe, it, expect, vi } from 'vitest';

const mockNode = {
    id: 'aws_instance.test',
    type: 'aws_instance',
    provider: 'aws',
    mode: 'managed',
    module: 'module.vpc',
    metadata: {
        name: 'test-instance',
        tags: { env: 'dev', owner: 'teamA' },
    },
};

describe('ResourcePanel', () => {
    it('renders node details', () => {
        render(<ResourcePanel node={mockNode} onClose={() => { }} />);

        expect(screen.getByText('aws_instance.test')).toBeInTheDocument();
        expect(screen.getByText('aws_instance')).toBeInTheDocument();
        expect(screen.getByText('aws')).toBeInTheDocument();
        expect(screen.getByText('managed')).toBeInTheDocument();
        expect(screen.getByText('module.vpc')).toBeInTheDocument();
    });

    it('renders metadata and tags correctly', () => {
        render(<ResourcePanel node={mockNode} onClose={() => { }} />);

        expect(screen.getByText('Metadata')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('test-instance')).toBeInTheDocument();

        // Tag section
        expect(screen.getByText('env: dev')).toBeInTheDocument();
        expect(screen.getByText('owner: teamA')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();
        render(<ResourcePanel node={mockNode} onClose={onClose} />);
        const button = document.querySelector('button');
        fireEvent.click(button!);
        expect(onClose).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});

